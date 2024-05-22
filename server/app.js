const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const cohorts = require("./cohorts.json");
const students = require("./students.json");
const cors = require("cors");
const mongoose = require("mongoose");
const student = require("../Models/Student");
const cohort = require("../Models/Cohort");
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

app.get("/api/cohorts", (req, res) => {
  res.json(cohorts);
});

app.get("/api/students", (req, res) => {
  res.json(students);
});

app.post("/api/cohorts", async (req, res) => {
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
    const cohort = new cohort({
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
    res.status(500).json(serverErrorMsg);
  }
});

app.get("/api/cohorts", async (req, res) => {
  try {
    const cohort = await cohorts.find({});
    res.send(cohort);
  } catch (error) {
    res.status(500).json(serverErrorMsg);
  }
});
app.get("/api/cohorts/:cohortId", async (req, res) => {
  const { cohortId } = req.params;
  try {
    const cohort = await cohorts.find({ cohortId });
  } catch (error) {
    res.status(500).json(serverErrorMsg);
  }
});

app.put("/api/cohorts/:cohortId", async (req, res) => {
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
    const cohort = await cohort.findByIdAndUpdate(
      id,
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
    res.status(500).send(error);
  }
});

app.delete("/api/cohorts/:cohortId", async (req, res) => {
  const { cohortId } = req.params;
  try {
    await Cohort.findByIdDelete(cohortId);
    await Student.findByIdDelete({ cohort: cohortId });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json(serverErrorMsg);
  }
});

//===============================

app.post("/api/students", async (req, res) => {
  try {
    const newStudent = await student.create({
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
  } catch (err) {
    res.status(500).json(serverErrorMsg);
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const allStudents = await student.find();
    res.status(200).json(allStudents);
  } catch (err) {
    res.status(500).json(serverErrorMsg);
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
    const students = await student.find({ cohort: cohortId });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json(serverErrorMsg);
  }
});

app.get("/api/students/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const notFoundMsg = { message: `No such cohort with id: ${studentId}` };

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(404).json(notFoundMsg);
    return;
  }

  try {
    const student = await student.find(studentId);
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json(serverErrorMsg);
  }
});

app.put("/api/students/:studentId", async (req, res) => {
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
    res.status(500).json(serverErrorMsg);
  }
});

app.delete("/api/students/:studenttId", async (req, res) => {
  const { studentId } = req.params;
  try {
    await Student.findByIdDelete(studentId);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json(serverErrorMsg);
  }
});

// START SERVER

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
