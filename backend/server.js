import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Malnad Family Restaurant backend is running");
});

app.get("/api/test", async (req, res) => {
  try {
    const count = await Event.countDocuments();
    res.json({ success: true, eventCount: count, model: "Event model working" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post("/api/book-event", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    
    const { fullName, phoneNumber, eventType, eventDate, numberOfGuests, message } = req.body;
    
    // Validate required fields
    if (!fullName || !phoneNumber || !eventType || !eventDate || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    const eventData = {
      name: fullName,
      phone: phoneNumber,
      eventType,
      date: eventDate,
      guests: Number(numberOfGuests),
      message: message || ''
    };
    
    console.log("Creating event with data:", eventData);
    
    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    console.log("Event saved successfully:", savedEvent._id);
    
    res.status(200).json({
      success: true,
      message: "Event enquiry received and saved successfully",
      eventId: savedEvent._id
    });
  } catch (error) {
    console.error("Detailed error saving event:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    res.status(500).json({
      success: false,
      message: "Failed to save event enquiry",
      error: error.message
    });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    console.log("Fetching events from database...");
    const events = await Event.find().sort({ createdAt: -1 });
    console.log("Events found:", events.length);
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("Detailed error fetching events:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});