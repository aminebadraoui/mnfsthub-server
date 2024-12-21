import express from "express";
import { signIn, signUp, signOut } from "../services/auth.service.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        console.log('Signup request data:', req.body);
        const result = await signUp(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ error: error.message });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await signIn(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.post("/signout", (req, res) => {
    try {
        signOut();
        res.json({ message: "Successfully signed out" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
