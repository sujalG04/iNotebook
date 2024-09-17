const express = require('express');
const Note = require('../models/Note');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser'); // middleware used to verify token
const { body, validationResult } = require('express-validator');
let success = false;
// ROUTE 1: get all notes by GET: "/api/note/fetchallnote" ;  login required
router.get('/fetchallnote', fetchuser, async (req, res) => {

    try {
        const note = await Note.find({ user: req.user.id });
        success = true;
        res.json({success , note});

    } catch (error) {
        success = false;
        console.error(error.message);
        res.status(500).send({success , error:"Internal Error Occured !"});
    }
});
// ROUTE 2: add all notes by POST: "/api/note/addnote" ;  login required
router.post('/addnote', fetchuser, [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'description length should be minimum 5').isLength({ min: 5 })
], async (req, res) => {
    try {


        const { title, description, tag } = req.body;

        // If there are errors return bad request and error msg
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success ,errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        success = true;
        res.json({success , savedNote});
    } catch (error) {
        success = false;
        console.error(error.message);
        res.status(500).send({success , error:"Internal Error Occured !"});
    }
});

// ROUTE 3: update an existing note using PUT: "/api/note/updatenote" ;  login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;
    //create newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    try {
        // find the note to be update and update it
        let note = await Note.findById(req.params.id);
        //check whether id is present or not
        if (!note) {
            success = false;
            return res.status(404).send({success , error:"Not Found"}) 
        };

        // check whether user update note is belongs to same user
        if (note.user.toString() !== req.user.id) {
            success = false;
            return res.status(401).send({success , error:"Not Allowed"});
        }
        // updating existing note 
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        success = true;
        res.json({success , note});
    } catch (error) {
        success = false;
        console.error(error.message);
        res.status(500).send({success , error:"Internal Error Occured !"});
    }

});

// ROUTE 4: delete an existing note using DELETE: "/api/note/deletenote" ;  login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // find the note to be update and update it
        let note = await Note.findById(req.params.id);
        //check whether id is present or not
        if (!note) {
            success = false;
            return res.status(404).send({success , error:"Not Found"})
        };

        // check whether user update note is belongs to same user
        if (note.user.toString() !== req.user.id) {
            success = false;
            return res.status(401).send({success , error:"Not Allowed"});
        }
        // deleting existing note 
        note = await Note.findByIdAndDelete(req.params.id);
        success = true;
        res.json({ success , note: note });
    } catch (error) {
        success = false;
        console.error(error.message);
        res.status(500).send({success , error:"Internal Error Occured !"});
    }

});
module.exports = router