const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./Models/Student.js");
const Cohort = require("./Models/Cohort.js");
const { handleNotFound } = require("./utils.js");
const serverErrorMsg = { message: "Internal Server Error" };


mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: `http://127.0.0.1:5173` }));



// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.post("/api/cohort", async (req, res, next) => {
  const {
    cohortSlug,
    cohortName,
    program,
    format,
    campus,
    startDate,
    inProgress,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;
  try {
    const cohort = await Cohort.create({
      cohortSlug,
      cohortName,
      program,
      format,
      campus,
      startDate,
      inProgress,
      programManager,
      leadTeacher,
      totalHours,
    });
    res.send(cohort);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cohorts", async (req, res, next) => {
  try {
    const cohort = await Cohort.find({});
    res.send(cohort);
  } catch (error) {
    next(error);
  }
});

app.all(["/api/cohorts/:cohortId", "/api/students/cohort/:cohortId"], (req, res, next) => {
  const { cohortId } = req.params;

  if (!mongoose.isValidObjectId(cohortId)) {
    handleNotFound(res);
    return;
  
  }
  next()
});

app.get("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const cohort = await Cohort.find({ cohortId });
    res.json(cohort);
  } catch (error) {
    next(error);
  }
});

app.put("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  const {
    cohortSlug,
    cohortName,
    program,
    format,
    campus,
    startDate,
    inProgress,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;

  try {
    const cohort = await Cohort.findByIdAndUpdate(
      cohortId,
      {
        cohortSlug,
        cohortName,
        program,
        format,
        campus,
        startDate,
        inProgress,
        programManager,
        leadTeacher,
        totalHours,
      },
      { new: true }
    );
    res.send(cohort);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    await Cohort.findByIdAndDelete(cohortId);
    await Student.findByIdAndDelete({ cohort: cohortId });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

//===============================

app.post("/api/students", async (req, res, next) => {
  try {
    const newStudent = await Student.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      linkedinUrl: req.body.linkedinUrl,
      languages: req.body.languages,
      program: req.body.program,
      background: req.body.background,
      image: req.body.image,
      cohort: req.body.cohort,
    });
    res.status(201).json(newStudent);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students", async (req, res, next) => {
  try {
    const allStudents = await Student.find().populate("cohort");
    res.status(200).json(allStudents);
  } catch (error) {
    next(error);
  }
});
app.get("/api/students/cohort/:cohortId", async (req, res) => {
  const { cohortId } = req.params;
  const notFoundMsg = { message: `No such cohort with id: ${cohortId}` };

  if (!mongoose.isValidObjectId(cohortId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const students = await Student.find({ cohort: cohortId }).populate(
      "cohort"
    );
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;
  const notFoundMsg = { message: `No such cohort with id: ${studentId}` };

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const student = await Student.find(studentId).populate("cohort");
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
});

app.put("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languages,
    program,
    background,
    image,
    cohort,
  } = req.body;
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        firstName,
        lastName,
        email,
        phone,
        linkedinUrl,
        languages,
        program,
        background,
        image,
        cohort,
      },
      { new: true }
    );
    res.status(200).json(updatedStudent);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:studenttId", async (req, res, next) => {
  const { studentId } = req.params;
  try {
    await Student.findByIdAndDelete(studentId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// START SERVER

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
