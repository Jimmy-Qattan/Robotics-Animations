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
  }

  static #animationParalysis = false;
  static #animationsAllowed = true;

  static ALL = [];

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
      "WARNING: Time Must be Between 25 and 1000000 milliseconds",
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

  static arraysNoNegatives(x) {
    if (!(x instanceof Array)) return;

    let status = true;

    x.forEach((value) => {
      if (value < 0 || value > 180) {
        status = false;
      }
    });

    return status;
  }

  static arrayAllNums(arr) {
    if (!Array.isArray(arr) || arr.length == 0) return false;

    arr.forEach((value) => {
      if (!Number.isInteger(value)) {
        return false;
      }
    });

    for (let i = 0; i < arr.length; i++) {
      if (!Number.isInteger(arr[i])) {
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
    if (!Number.isInteger(this.getNumOfServos)) {
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
      ANIMATION.ALL.push(this);
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

  setFinalDestination(arr) {
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
    if (ANIMATION.areArraysSame(arr, this.#initialServoPositions)) {
      this.#isPause = true;

      ANIMATION.printError(
        this.getName,
        `ANIMATION HAS BEEN SET TO A PAUSE FOR " + ${this.#time} + " MILLISECONDS`,
      );
      return;
    } else {
      this.#finalServoPositions = arr;
      this.#isPause = false;
    }
  }

  get getDefaultServoValue() {
    return this.#defaultServoValue;
  }

  get getFinalDestination() {
    return this.#finalServoPositions;
  }

  setInitialDestination(arr) {
    // SETTER FOR INITIAL SERVO POSITONS
    if (!this.checkArray(arr)) {
      return;
    }
    // if (ANIMATION.arrayAllNums(arr) /**Checks values AND if array length is greater than 0 */) {

    // }
    this.#initialServoPositions = arr;
  }

  get getInitialDestination() {
    return this.#initialServoPositions;
  }

  setTime(time) {
    // SETTER FOR TIME
    if (!Number.isInteger(time) || Number(time) < 25 || Number(time) > 1000000) {
      ANIMATION.printError(this.getName, "Time must be a number between 25 and 1000000");
      return;
    }
    this.#time = Number(time);
  }

  get getTime() {
    return this.#time;
  }

  setName(name) {
    // SETTER FOR NAME
    if (!(name instanceof String) || String(name).length < 1) return;
    this.#name = String(name);
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
      !Number.isInteger(val) ||
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
    if (!Number.isInteger(val) || Number(val) < 0 || Number(val) > 180) {
      throw new Error("Default Servo Value must be a Number between 0 and 180");
      return;
    }

    this.#defaultServoValue = Number(val);
  }

  // FOR MOTION DATA

  static initArray(num, val = 90) {
    if (!Number.isInteger(num) || !Number.isInteger(val)) return;
    let newArr = [];
    for (let i = 0; i < num; i++) {
      newArr.push(val);
    }

    return newArr;
  }

  get determineStepSize() {
    if (!this.initialized) return;

    let currentSpeeds = ANIMATION.initArray(this.getNumOfServos);
    currentSpeeds?.forEach((value, index) => {
      currentSpeeds[index] = value / this.getTime;
    });

    this.setStepSizes(currentSpeeds);
    return currentSpeeds;
  }

  setStepSizes(arr) {
    if (!Array.isArray(arr) || arr.length != this.getNumOfServos || !this.initialized || ANIMATION.arrayAllNums(arr)) return;
    this.#stepSizes = arr;
  }
}

// Have a function that moves to a certain position in a certain time
// Use the time to determine an interpolation for each individual servo and user can choose the type of interpolation
// Have animationParalysis utilized in order to wait until the bird is finished with it's motion before doing anything else
