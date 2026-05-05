class ANIMATION {
  #initialized = false;

  #name;
  #initialServoPositions;
  #finalServoPositions;
  #time;
  #interpolationType;
  #isPause;
  #stepSizes;
  #numOfServos;

  #defaultServoValue;

  constructor(
    name = "Animation Frame",
    initialServoPositions = [90],
    finalServoPositions = [90],
    time = 2000,
    interpolationType = "linear",
    numOfServos = 4,
    isPause = false,
  ) {
    this.#name = name;
    this.#initialServoPositions = initialServoPositions;
    this.#finalServoPositions = finalServoPositions;
    this.#time = time;
    this.#interpolationType = interpolationType;
    this.#isPause = isPause;
    this.#numOfServos = numOfServos;
    this.#stepSizes = [0];
    this.#defaultServoValue = 90;

    this.initialize();
    this.checkIfPause();
  }

  static #animationParalysis = false;
  static #animationsAllowed = true;

  static maxTime = 100000;
  static minTime = 25;
  static errorTimeReturn = 5000; // For input type errors on time

  static #ALL = [];
  static #ACTIVE = [];
  static #ACTIVECUT = [];
  static #currentServoPositions;
  static #lastRoundedServoPosition;

  static #centerPosition;

  static #interpolationTypes = ["linear", "quadratic"];

  static servoPositionsInitialized = false;

  static RUNNING = false;
  static INTERUPTTED = false;

  static HELP(color = "green", color2 = "red", color3 = "yellow") {
    ANIMATION.printColor("INSTRUCTIONS FOR SETTING UP ANIMATION FRAME:", color);
    ANIMATION.printColor(
      "--------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter One: Start With A Name! Make it Fun and Memorable",
      color,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter Two: Create an Array with Your Servo Positions for your Animation Frame",
      color,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter Three: Create another Array with Your TARGET Servo Positions for your Animation Frame.",
      color,
    );
    ANIMATION.printColor(
      "WARNING: MAKE SURE YOUR INITIAL AND TARGET SERVO POSITION ARRAYS ARE EQUAL IN LENGTH OR THEY WILL BE AUTOMATICALLY TRUNCATED",
      color2,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter Four: Set up the Duration in which your Animation Runs to Complete",
      color,
    );
    ANIMATION.printColor(
      `WARNING: Time Must be Between ${ANIMATION.minTime} and ${ANIMATION.maxTime} milliseconds`,
      color2,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter Five: Set up your interpolation type. Ex: Linear type will keep your animation at constant speed while quadratic will create a slow to quick motion",
      color,
    );
    ANIMATION.printColor(
      "WARNING: Any Interpolations other than Linear and Quadratic will be set to Linear if you set it to any undefined type",
      color2,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Parameter Six: Specify the Number of Servos that your Animation will Include",
      color,
    );
    ANIMATION.printColor(
      "WARNING: Any servo number value that is outside of range of Arrays will truncate/extend Arrays to your specified servo amount",
      color2,
    );
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
    ANIMATION.printColor(
      "Paramter Seven: Specify the default servo value in which your arrays will be extended by if the number of elements do not meet the servo count",
      color,
    );
    ANIMATION.printColor("WARNING: VALUE MUST BE BETWEEN 0 AND 180", color2);
    ANIMATION.printColor(
      "----------------------------------------------------------------------------------------",
      color3,
    );
  }

  static areArraysSame(x, y) {
    // Used to check if the final and inital positon arrays are equal to one another
    return JSON.stringify(x) === JSON.stringify(y);
  }

  static get getServoCount() {
    return this.#ACTIVE[0].getNumOfServos;
  }

  static arraysNoNegatives(x) {
    if (!(x instanceof Array)) return;

    let status = true;

    x.forEach((value) => {
      if (value < 0 || value > 180 || !Number.isFinite(value)) {
        status = false;
      }
    });

    return status;
  }

  static arrayAllNums(arr) {
    if (!Array.isArray(arr) || arr.length == 0) return false;

    arr.forEach((value) => {
      if (!Number.isFinite(value)) {
        return false;
      }
    });

    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   * @param {string} name
   * @param {string} message
   * @param {string} color
   */

  static printError(name, message, color = "red") {
    console.log(`%c${name}: ${message}`, `color: ${color};`);
  }

  /**
   *
   * @param {string} message
   * @param {string} color
   */

  static printColor(message, color = "red") {
    console.log(`%c${message}`, `color: ${color}`);
  }

  destSizesGood(
    arr1 = this.getInitialDestination,
    arr2 = this.getFinalDestination,
  ) {
    if (
      arr1.length != this.getNumOfServos ||
      arr2.length != this.getNumOfServos
    ) {
      return false;
    }

    return true;
  }

  checkIfPause() {
    // LEFT OFF HERE in order to set pause when initielized
    this.#isPause = ANIMATION.areArraysSame(
      this.getInitialDestination,
      this.getFinalDestination,
    );
  }

  trimArrays(
    arr1 = this.getInitialDestination,
    arr2 = this.getFinalDestination,
  ) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return;

    let [l1, l2, difference] = [arr1.length, arr2.length, 0];

    if (!this.getNumOfServos) {
      if (l1 == l2) {
        return { status: true };
      } else {
        if (l1 > l2) {
          difference = l1 - l2;

          this.#initialServoPositions.splice(
            this.getInitialDestination.length - difference,
            difference,
          );

          return { status: "initialCut" };
        } else if (l2 > l1) {
          difference = l2 - l1;

          this.#finalServoPositions.splice(
            this.getFinalDestination.length - difference,
            difference,
          );

          return { status: "finalCut" };
        }
      }
    } else {
      let bothArrays = [arr1, arr2];
      let arrayLengths = [l1, l2];
      const desiredLength = this.getNumOfServos ?? 0;

      arrayLengths.forEach((LENGTH, INDEX) => {
        if (LENGTH < desiredLength) {
          difference = desiredLength - LENGTH;
          for (let i = 0; i < difference; i++) {
            bothArrays[INDEX].push(this.#defaultServoValue);
          }

          switch (INDEX) {
            case 0:
              ANIMATION.printError(
                this.getName,
                `Initial Servo Destinations has been extended to ${this.getNumOfServos} values with ${this.getDefaultServoValue} as defaults`,
              );
              break;
            case 1:
              ANIMATION.printError(
                this.getName,
                `Final Servo Destinations has been extended to ${this.getNumOfServos} values with ${this.getDefaultServoValue} as defaults`,
              );
              break;
            default:
          }
        } else if (LENGTH > desiredLength) {
          difference = LENGTH - desiredLength;
          bothArrays[INDEX].splice(
            bothArrays[INDEX].length - difference,
            difference,
          );

          switch (INDEX) {
            case 0:
              ANIMATION.printError(
                this.getName,
                `Initial Servo Destinations has been truncated to ${this.getNumOfServos} value(s)`,
              );
              break;
            case 1:
              ANIMATION.printError(
                this.getName,
                `Final Servo Destinations has been truncated to ${this.getNumOfServos} value(s)`,
              );
              break;
            default:
          }
        }
      });
    }
  }

  initialize() {
    //if (this.initialized) return;
    this.trimArrays();

    if (
      !ANIMATION.arrayAllNums(this.getInitialDestination) &&
      ANIMATION.arrayAllNums(this.getFinalDestination)
    ) {
      // this.setInitialDestination(this.getFinalDestination);
      this.#initialServoPositions = this.getFinalDestination;
    } else if (
      ANIMATION.arrayAllNums(this.getInitialDestination) &&
      !ANIMATION.arrayAllNums(this.getFinalDestination)
    ) {
      // this.setFinalDestination(this.getInitialDestination);
      this.#finalServoPositions = this.getFinalDestination;
    }

    // Mainly used to take the number of servos user specified and set the array lengths of ini and fin servo positions and rotor speed variables
    if (!Number.isFinite(this.getNumOfServos)) {
      this.#numOfServos = this.getInitialDestination.length;

      ANIMATION.printError(
        this.getName,
        `Number of Servos has been Modified to ${this.getNumOfServos}`,
      );
    }

    if (this.getNumOfServos != this.getInitialDestination.length) {
      this.#numOfServos = this.getInitialDestination.length;

      ANIMATION.printError(
        this.getName,
        `Number of Servos Modified to ${this.getNumOfServos}`,
      );
    }

    let newArray = ANIMATION.initArray(this.getNumOfServos) ?? [90]; // this is the nullish coalscaling operator. It checks if the left hand is undefined and if it is, then replace it with the right hand side. Prevents bugs/issues
    let stepSizeArray = ANIMATION.initArray(this.getNumOfServos, 0) ?? [90];

    if (!this.destSizesGood()) {
      this.setInitialAndFinalDest(newArray, newArray);
    }

    if (this.initialized == false) {
      ANIMATION.#ALL.push(this);
    }

    this.#stepSizes = stepSizeArray;
    this.#initialized = true;
    this.setInterpolationType(this.getInterpolationType);
  }

  checkArray(arr) {
    if (
      !Array.isArray(arr) ||
      arr.length != this.getNumOfServos ||
      !ANIMATION.arraysNoNegatives(arr)
    ) {
      return false;
    } else {
      return true;
    }
  }

  setInitialAndFinalDest(arr1, arr2) {
    if (!this.checkArray(arr1) || !this.checkArray(arr2)) return;
    this.setInitialDestination(arr1);
    this.setFinalDestination(arr2);
  }

  async setFinalDestination(arr, run = false) {
    // SETTER FOR FINAL SERVO POSITIONS
    if (!this.checkArray(arr)) {
      this.setFinalDestination(
        ANIMATION.initArray(
          this.getNumOfServos ?? 0,
          this.getDefaultServoValue ?? 90,
        ),
      );
      return;
    }

    this.checkIfPause();

    if (ANIMATION.areArraysSame(arr, this.#initialServoPositions)) {
      this.#isPause = true;

      ANIMATION.printError(
        this.getName,
        `ANIMATION HAS BEEN SET TO A PAUSE FOR ${this.#time} MILLISECONDS`,
      );
      return;
    } else {
      if (run) {
        await this.runToPosition(arr).then(() => {
          this.#finalServoPositions = arr;
          console.log(this.#finalServoPositions + " YAYAYYYYY");
        });
      } else {
        this.#finalServoPositions = arr;
      }

      this.#isPause = false;
    }
  }

  get getDefaultServoValue() {
    return this.#defaultServoValue;
  }

  get getFinalDestination() {
    return this.#finalServoPositions;
  }

  async setInitialDestination(arr, run = false) {
    // SETTER FOR INITIAL SERVO POSITONS
    if (!this.checkArray(arr)) {
      return;
    }

    this.checkIfPause();

    // if (ANIMATION.arrayAllNums(arr) /**Checks values AND if array length is greater than 0 */) {

    // }

    if (run) {
      await this.runToPosition(arr).then(() => {
        this.#initialServoPositions = arr;
        console.log(this.#initialServoPositions + " YAYAYYYYY");
      });
    } else {
      this.#initialServoPositions = arr;
    }
  }

  get getInitialDestination() {
    return this.#initialServoPositions;
  }

  setTime(time) {
    // SETTER FOR TIME
    if (!Number.isFinite(time)) {
      ANIMATION.printError(
        this.getName,
        `Time must be a number between ${ANIMATION.minTime} and ${ANIMATION.maxTime}`,
      );
      return;
    }

    this.#time = this.clampTimeReturn(Number(time));

    ANIMATION.printColor(
      `${this.getName}: Time successfully set to ${this.getTime} milliseconds`,
      "green",
    );
  }

  clampTimeReturn(time) {
    if (!Number.isFinite(time)) {
      ANIMATION.printError(
        "ANIMATION",
        `Time-- ${time}-- must be a finite, numeric value`,
      );
      return this.getTime ?? ANIMATION.errorTimeReturn;
    }

    if (time > ANIMATION.maxTime) {
      return ANIMATION.maxTime;
    } else if (time < ANIMATION.minTime) {
      return ANIMATION.minTime;
    } else {
      return time;
    }
  }

  get getTime() {
    return this.#time;
  }

  setName(name) {
    // SETTER FOR NAME
    if (typeof name != "string" || String(name).length < 1) return;
    this.#name = String(name);

    ANIMATION.printColor(`Name Successfully Set To ${name}`);
  }

  get getName() {
    return this.#name;
  }

  setInterpolationType(type = this.getInterpolationType) {
    if (!(typeof type == "string")) return;

    let returnType;

    switch (String(type)) {
      case "linear":
        returnType = "linear";
        break;
      case "quadratic":
        returnType = "quadratic";
        break;
      default:
        returnType = "linear";
    }

    this.#interpolationType = returnType;

    ANIMATION.printError(
      this.getName,
      `Interpolation type modified to ${returnType}`,
    );
  }

  get getInterpolationType() {
    return this.#interpolationType;
  }

  setAll(name, ini, fin, time, int) {
    this.setName(name);
    this.setInitialDestination(ini);
    this.setFinalDestination(fin);
    this.setTime(time);
    this.setInterpolationType(int);
  }

  get getAll() {
    // GETTER FOR ALL VALUES OF THE OBJECT
    return {
      name: this.#name,
      initialDestination: this.#initialServoPositions,
      finalDestination: this.#finalServoPositions,
      time: this.#time,
      interpolationType: this.#interpolationType,
    };
  }

  get initialized() {
    return this.#initialized;
  }

  get getNumOfServos() {
    return this.#numOfServos;
  }

  setNumOfServos(val) {
    if (
      !Number.isFinite(val) ||
      val < 0 ||
      val == this.getNumOfServos ||
      !this.initialized
    )
      return;

    let difference = Math.abs(val - this.getNumOfServos);

    if (val > this.getNumOfServos) {
      for (let i = 0; i < difference; i++) {
        this.#initialServoPositions.push(this.getDefaultServoValue);
        this.#finalServoPositions.push(this.getDefaultServoValue);
      }
    } else {
      this.#initialServoPositions.splice(
        this.getInitialDestination.length - difference,
        difference,
      );
      this.#finalServoPositions.splice(
        this.getFinalDestination.length - difference,
        difference,
      );
    }

    this.#numOfServos = val;
    ANIMATION.printColor(
      `Number of Servos Successfully set to ${this.getNumOfServos} Servos`,
      "green",
    );
  }

  setDefaultServoValue(val) {
    if (!Number.isFinite(val) || Number(val) < 0 || Number(val) > 180) {
      throw new Error("Default Servo Value must be a Number between 0 and 180");
      return;
    }

    this.#defaultServoValue = Number(val);
  }

  // FOR MOTION DATA

  static initArray(num, val = 90) {
    if (!Number.isFinite(num) || !Number.isFinite(val)) return;
    let newArr = [];
    for (let i = 0; i < num; i++) {
      newArr.push(val);
    }

    return newArr;
  }

  get isPaused() {
    return this.#isPause;
  }

  static get getCurrentServoPositions() {
    return this.#currentServoPositions;
  }

  get determineStepSize() {
    if (!this.initialized) return;

    const stepSizes = this.getFinalDestination.map((element, index) => {
      return (element - this.getInitialDestination[index]) / this.getTime;
    });

    this.setStepSizes(stepSizes);
    return stepSizes;
  }

  setStepSizes(arr) {
    if (
      !Array.isArray(arr) ||
      arr.length != this.getNumOfServos ||
      !this.initialized ||
      ANIMATION.arrayAllNums(arr)
    )
      return;
    this.#stepSizes = arr;
  }

  // TO CREATE OUR FUNCTIONS TO MOVE!

  static disableAnimations() {
    if (ANIMATION.#animationsAllowed) {
      ANIMATION.#animationsAllowed = false;
      ANIMATION.printColor("Animations Turned Off", "green");
    } else {
      ANIMATION.printColor("Animations Are Already Off", "red");
    }
  }

  static enableAnimations() {
    if (!ANIMATION.#animationsAllowed) {
      ANIMATION.#animationsAllowed = true;
      ANIMATION.printColor("Animations Turned On", "green");
    } else {
      ANIMATION.printColor("Animations Are Already On", "red");
    }
  }

  static get isAnimationsOn() {
    return ANIMATION.#animationsAllowed;
  }

  static toggleAnimations() {
    this.#animationsAllowed = !this.#animationsAllowed;
    if (ANIMATION.isAnimationsOn) {
      ANIMATION.printColor("Animations Turned On", "green");
    } else {
      ANIMATION.printColor("Animations Turned Off", "red");
    }
  }

  static initializeServoPositions(positionArray) {
    // Dont regard the size of array for now.

    if (positionArray instanceof Array && positionArray.length == 0) {
      ANIMATION.printError(
        "ANIMATION",
        "Argument must be an array with length of 1 or greater",
        "red",
      );
      return;
    }

    if (ANIMATION.arraysNoNegatives(positionArray)) {
      ANIMATION.#currentServoPositions = positionArray;
      ANIMATION.servoPositionsInitialized = true;
      ANIMATION.printColor("Servo Positions Successfully Initialized", "green");
    } else {
      ANIMATION.printError(
        "ANIMATION",
        "Values of array must be numbers between 0 and 180",
        "red",
      );
    }
  }

  pushToActive() {
    if (!this.initialized) return;

    if (!ANIMATION.#ACTIVE.includes(this)) {
      ANIMATION.#ACTIVE.push(this);
    } else {
      ANIMATION.printError(
        this.getName,
        "This Frame is already In Active Region",
        "yellow",
      );
    }
  }

  get createClone() {
    let clone = new ANIMATION(
      this.getName,
      this.getInitialDestination,
      this.getFinalDestination,
      this.getTime,
      this.getInterpolationType,
      this.getNumOfServos,
      this.isPaused,
    );
    return clone;
  }

  static initializeActiveAnimationServoCounts() {
    // Append new animationFrame's to ANIMATION.#ACTIVECUT
    if (!ANIMATION.servoPositionsInitialized) {
      ANIMATION.printColor(
        "Servo Positions Must be Initialized before running ANIMATION.initializeActiveAnimationServoCounts() using initializeServoPositions([servo position array])",
        "red",
      );
      return;
    }

    if (!ANIMATION.#ACTIVE.length) {
      ANIMATION.printColor(
        "You must have some active animation frames before running ANIMATION.initializeActiveAnimationServoCounts()",
        "red",
      );
      return;
    }

    const servoCount = ANIMATION.#currentServoPositions.length;

    this.#ACTIVECUT = [];

    ANIMATION.#ACTIVE.forEach((animationFrame) => {
      let newFrame = animationFrame.createClone;
      newFrame.setNumOfServos(servoCount);

      ANIMATION.#ACTIVECUT.push(newFrame);
    });
  }

  static degreesToRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  static get isReady() {
    if (
      this.#animationParalysis ||
      !this.#animationsAllowed ||
      !this.#ACTIVE.length ||
      this.RUNNING
    )
      return false;

    this.printColor("Animations Booting Up!!...", "green");
    return true;
  }

  addStep() {
    const newPosArray = ANIMATION.#currentServoPositions.map(
      (element, index) => {
        return element + this.#stepSizes[index];
      },
    );

    return newPosArray;
  }

  static INTERUPT() {
    if (this.RUNNING) {
      this.INTERUPTTED = true;
      this.printColor("ANIMATION HAS BEEN INTERUPPTED");
    } else {
      this.printColor(
        "No Animations are Running, therefore No Interupptions Were Made",
      );
    }
  }

  checkIfAbsoluteValueOfAnimationArrayChanged() {
    const newRoundedValues = ANIMATION.roundAllValuesInArray(
      ANIMATION.getCurrentServoPositions,
      true,
    );
    const newRoundedValues2 = ANIMATION.roundAllValuesInArray(
      this.addStepToCurrentServoPositionsValue,
      true,
    );

    if (!ANIMATION.areArraysSame(newRoundedValues, newRoundedValues2)) {
    }
  }

  addStepToCurrentServoPositions() {
    //if (!ANIMATION.isReady || !this.initialized) return;
    //ANIMATION.#currentServoPositions += this.determineStepSize; OMFG

    ANIMATION.getCurrentServoPositions.forEach((value, index) => {
      ANIMATION.#currentServoPositions[index] +=
        this.determineStepSize[index] * 100;
    });

    return ANIMATION.getCurrentServoPositions;
  }

  get addStepToCurrentServoPositionsValue() {
    //if (!ANIMATION.isReady || !this.initialized) return;

    const newArray = ANIMATION.getCurrentServoPositions.map((value, index) => {
      return value + this.determineStepSize[index];
    });

    return newArray;
  }

  static roundAllValuesInArray(arr, strict = false) {
    const newArray = arr.map((value) => {
      return Math.round(strict ? value - 0.5 : value);
    });

    return newArray;
  }

  static get lastRoundedServoValues() {
    return this.#lastRoundedServoPosition;
  }

  static #checkNewRoundedValuesForServoTransit(newArray) {
    if (
      !this.areArraysSame(
        this.#lastRoundedServoPosition,
        this.roundAllValuesInArray(newArray, true),
      )
    ) {
      window.dispatchEvent(
        new CustomEvent("animationData", {
          detail: this.#lastRoundedServoPosition,
        }),
      );
      this.#setRoundedServoValuesFromUnRounded(newArray);
      console.log(this.lastRoundedServoValues);
      setRotationsOf3DFiguresFromDegrees(this.#lastRoundedServoPosition);
    }
  }

  static #setRoundedServoValuesFromUnRounded(arr) {
    this.#lastRoundedServoPosition = this.roundAllValuesInArray(arr, true);
  }

  async runAnimation(fromCurrentServoPositions = false) {
    if (!ANIMATION.isReady) {
      return;
    }

    if (ANIMATION.INTERUPTTED) {
      return;
    }

    if (
      ANIMATION.areArraysSame(
        ANIMATION.getCurrentServoPositions,
        this.getFinalDestination,
      )
    ) {
      ANIMATION.printColor("Final Destination has already been reached");
      return;
    }

    ANIMATION.RUNNING = true;

    const beginningDestinationOriginal = this.getInitialDestination;

    const currentServoPositions = ANIMATION.getCurrentServoPositions;
    this.setInitialDestination(currentServoPositions);

    const thisAnimation = this;

    const animationDuration = this.getTime;

    let animationId;

    let startTime, now;
    startTime = now = performance.now();

    return new Promise((resolve, reject) => {
      animationId = requestAnimationFrame(run);

      function run() {
        now = performance.now();

        const interpolation = (now - startTime) / animationDuration;

        if (interpolation >= 1 && !ANIMATION.INTERUPTTED) {
          if (
            !ANIMATION.areArraysSame(
              ANIMATION.getCurrentServoPositions,
              thisAnimation.getFinalDestination,
            )
          ) {
            thisAnimation.setInitialAndFinalDest(
              ANIMATION.roundAllValuesInArray(beginningDestinationOriginal),
              ANIMATION.roundAllValuesInArray(
                thisAnimation.getFinalDestination,
              ),
            );

            ANIMATION.#currentServoPositions =
              thisAnimation.getFinalDestination;

            ANIMATION.#lastRoundedServoPosition =
              ANIMATION.getCurrentServoPositions;
          }

          resolve("Success");
          ANIMATION.printColor(
            "Animation Successful! Stats: " +
              ANIMATION.getCurrentServoPositions,
            "green",
          );

          ANIMATION.RUNNING = false;
          cancelAnimationFrame(animationId);
          return;
        }

        if (ANIMATION.INTERUPTTED) {
          reject("Interupption");
          cancelAnimationFrame(animationId);
          return;
        }

        // thisAnimation.checkIfAbsoluteValueOfAnimationArrayChanged(
        //   ANIMATION.getCurrentServoPositions,
        // );
        // thisAnimation.checkIfAbsoluteValueOfAnimationArrayChanged();

        //thisAnimation.addStepToCurrentServoPositions();
        // Instead of having an addStep Function, we can just create a function that determines position based on time interpolation
        // It would be much more straightforth, cleaner, more accurate, and easier to manipulate when it comes to other interpolation types that are non-linear

        const newPositionFromInterpolation =
          thisAnimation.determinePositionFromInterpolation(
            interpolation,
            fromCurrentServoPositions
              ? ANIMATION.getCurrentServoPositions
              : thisAnimation.getInitialDestination,
            thisAnimation.getFinalDestination,
          );

        ANIMATION.#checkNewRoundedValuesForServoTransit(
          newPositionFromInterpolation,
        );
        ANIMATION.#setRoundedServoValuesFromUnRounded(
          newPositionFromInterpolation,
        );

        setRotationsOf3DFiguresFromDegrees(ANIMATION.#lastRoundedServoPosition);

        //console.log(ANIMATION.#lastRoundedServoPosition);

        //console.log(ANIMATION.getCurrentServoPositions);

        animationId = requestAnimationFrame(run);
      }
    });
  }

  determinePositionFromInterpolation(
    interpolation,
    initial,
    final,
    interpolationThreshold = 0.005,
  ) {
    // To pass in interpolation, then initial position, then final position

    if (1 - interpolation <= interpolationThreshold) {
      return final;
    }

    let initialPosition = initial;
    let finalPosition = final;

    let differenceArray = finalPosition.map((value, index) => {
      return value - initialPosition[index];
    });

    let modifiedInterpolationConstant;

    switch (this.getInterpolationType) {
      case "linear":
        modifiedInterpolationConstant = interpolation;
        break;
      case "quadratic":
        modifiedInterpolationConstant = Math.pow(interpolation, 2);
        break;
      default:
        console.log(
          "There is a bug within the interpolation initialization. There should only be 2 options right now",
        );
    }

    const returnArray = initialPosition.map((value, index) => {
      return value + modifiedInterpolationConstant * differenceArray[index];
    });
    return returnArray;

    console.log(returnArray);
  }

  static setTimeAll(arr, time, fillerTimes = 5000) {
    if (arr instanceof ANIMATION) {
      if (time instanceof Array) {
        arr.setTime(time[0]);
      } else if (Number.isFinite(time)) {
        arr.setTime(time);
      } else {
        this.printColor(
          "Value in first parameter must be a singular Animation (best done using instancename.setTime(time)) or an array of ANIMATION Objects",
        );
        return;
      }

      this.printColor(
        "Changing one instance can be done just using instanceName.setTime(time)",
      );

      return;
    }

    if (!(arr instanceof Array))
      return new Error(
        "Instances must be an array of Animation Objects. Changing One Instance should be done using instance.setTime(time)",
      );

    arr.forEach((animation, index) => {
      if (!(animation instanceof ANIMATION)) {
        this.printColor(
          `This Instance of ${typeof animation} + Must Be An Animation Object`,
        );
      }

      if (Number.isFinite(time)) {
        animation.setTime(time);
      } else if (time instanceof Array) {
        animation.setTime(time[index] ?? time[time.length - 1]);
      } else {
        return new Error(
          "Time Must be either a single number of an array of numbers",
        );
      }
    });
  }

  static numRepeat(num) {
    return this.initArray(this.#ACTIVE[0].getNumOfServos ?? 0, num);
  }

  setFinalPositionRandomized(center = 90, range = 90, modifyOriginal = false) {
    if (center < 0 || center > 180 || !Number.isFinite(center)) return;
    if (!Number.isFinite(range)) return;
    let initialArray = ANIMATION.initArray(this.getNumOfServos, center);

    const finalArray = initialArray.map((value) => {
      const randomNumber =
        Math.floor(Math.random() * Math.abs(range)) - Math.abs(range) / 2;

      let modifiedValue = value + randomNumber;

      if (modifiedValue < 0) {
        modifiedValue = 0;
      } else if (modifiedValue > 180) {
        modifiedValue = 180;
      }

      return Math.ceil(modifiedValue);
    });

    if (modifyOriginal) {
      this.setFinalDestination(finalArray);
    }

    return finalArray;
  }

  runToCenterPosition() {
    if (!ANIMATION.#centerPosition) return;
    const currentServoPositionFinal = this.getFinalDestination;
    this.setFinalDestination(ANIMATION.#centerPosition);
    this.runAnimation().then(() => {
      this.setFinalDestination(currentServoPositionFinal);
      ANIMATION.printColor(
        `Animation Final Destination set back to ${currentServoPositionFinal}`,
        "green",
      );
    });
  }

  async runToPosition(position) {
    if (!this.checkArray(position)) {
      this.runAnimation();
      return;
    }

    const currentDestinationFinal = this.getFinalDestination;
    const currentDestinationInitial = this.getInitialDestination;

    this.setFinalDestination(position);

    console.log(`Going from ${currentDestinationInitial} to ${position}`);

    await this.runAnimation().then(() => {
      this.setInitialAndFinalDest(
        currentDestinationInitial,
        currentDestinationFinal,
      );
    });
  }

  async runToRandomPosition(center = 90, range = 90, modifyOriginal = false) {
    if (
      !ANIMATION.isReady ||
      !Number.isFinite(center) ||
      !Number.isFinite(range)
    )
      return;

    const currentFinalDestination = !modifyOriginal
      ? this.getFinalDestination
      : null;
    const currentInitialDestination = !modifyOriginal
      ? this.getInitialDestination
      : null;

    const currentInterpolationType = !modifyOriginal
      ? this.getInterpolationType
      : null;

    this.setFinalPositionRandomized(center, range, true);

    this.setInterpolationType(
      ANIMATION.#interpolationTypes[
        Math.floor(Math.random() * (ANIMATION.#interpolationTypes.length - 1))
      ],
    );

    ANIMATION.printColor(
      `Interpolation type set to ${this.getInterpolationType}`,
    );

    await this.runAnimation().then(() => {
      if (!modifyOriginal) {
        console.log(currentFinalDestination);
        this.setInitialAndFinalDest(
          currentInitialDestination,
          currentFinalDestination,
        );
        this.setInterpolationType(currentInterpolationType);
        ANIMATION.printColor(
          `Final Destination points set back to ${currentFinalDestination} and interpolation type is set back to ${currentInterpolationType}`,
        );
      }
    });
  }
}

// Use the time to determine an interpolation for each individual servo and user can choose the type of interpolation
// Have animationParalysis utilized in order to wait until the bird is finished with it's motion before doing anything else

const k = new ANIMATION();
const j = new ANIMATION();
k.setInitialAndFinalDest([0, 0, 0, 0], [180, 180, 180, 180]);
k.pushToActive();
j.pushToActive();
ANIMATION.initializeServoPositions([90, 90, 90, 90]);

ANIMATION.setTimeAll([k, j], 3000);

function setRotationsOf3DFiguresFromDegrees(rotations) {
  const allRotatableFigures = document.querySelectorAll("[rotation-listener]");

  const newDegMapping = rotations.map((value) => {
    return ANIMATION.degreesToRadians(value) - Math.PI / 2;
  });

  allRotatableFigures.forEach((figure, index) => {
    const axisOfRot = figure.getAttribute("rotation-listener").axis;
    figure.object3D.rotation[axisOfRot] = newDegMapping[index];
  });
}
