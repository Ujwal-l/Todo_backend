const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

//send email

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

app.post("/send-email", (req, res) => {
  const { name, email, age, introduction } = req.body.user;

  const mailOptions = {
    from: email,
    to: "ujwal565@gmail.com",
    subject: "Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nAge: ${age}\nMessage: ${introduction}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

// Add task
app.post("/tasks", async (req, res) => {
  const { username, task } = req.body;
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ username, task }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

//delete taska

app.delete("/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  console.log(`Deleting task with ID: ${taskId}`);
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error.message);
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Task deleted successfully" });
});

// Get tasks
app.get("/tasks", async (req, res) => {
  const { data, error } = await supabase.from("tasks").select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Update task status
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { is_done } = req.body;
  const { data, error } = await supabase
    .from("tasks")
    .update({ is_done })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Search tasks
app.get("/tasks/search", async (req, res) => {
  const { q } = req.query;
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .ilike("task", `%${q}%`);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
