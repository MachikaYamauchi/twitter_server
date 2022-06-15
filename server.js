import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import multer from 'multer';
import fs from 'fs';



const db = mysql.createConnection({
    host:'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'Twitter_crud'
})

const server = express();
server.use(cors());
server.use(express.json());
server.use(express.static('uploads'))

db.connect(error=>{
    if(error)
        console.log('Sorry cannot connect to db: ', error);
    else
        console.log('Connected to mysql db');
})

// configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
})

// create instance of multer configuration settings
const fileupload = multer({storage:storage})

server.post('/upload', fileupload.single("file_fromC"), (req, res) => {
    res.json({fileupload:true});
})


server.get('/tweets', (req, res) => {
    let query = "CALL `getTweets`()";
    db.query(query, (error, alltweets) => {
        if(error) {
            res.json({alltweets:false, mesasge:error})
        }
        else {
            res.json({alltweets:alltweets[0], message:"return tweeets"})
        }
    })
})

server.get('/tweets/:id', (req, res) => {
    let query = "CALL `getTweetByID`(?)";
    db.query(query, [req.params.id], (error, tweet) => {
        if(error) {
            res.json({tweet:false, message:error})
        }
        else {
            res.json({tweet:tweet[0][0], mesasge:"Returned tweet by ID"})
        }
    })
})

server.post('/tweets', (req, res) => {
    let query = " CALL `addTweet`(?, ?)";
    db.query(query, [req.body.tweet, req.body.tweet_img], (error, newtweet) => {
        if(error) {
            res.json({newtweet:false, message:error});
        }
        else {
            res.json({newtweet:newtweet[0][0], mesasge:"add success"});
        }
    })
})

server.delete('/tweets/:id', (req, res) => {
    let query = "CALL `deleteTweet`(?)";
    let getFilename = "CALL `getTweetByID`(?)";
    db.query(getFilename, [req.params.id], (error, data) => {
        // res.json(data[0][0].tweet_img);
        if(error) {
            res.json({getFilename:false, message:error})
        }
        else {
            let file_to_be_deleted = data[0][0].tweet_img;
            fs.unlink('./uploads/' + file_to_be_deleted, (error) => {
                if(error) {
                    res.json({deleteStatus:false, message:error})
                }
                else {
                    // res.json({deleteStatus:true, message:"success delete file"})
                    db.query(query, [req.params.id], (error, deleteStatus) => {
                        if(error) {
                            res.json({deleteStatus:false, message:error});
                        }
                        else {
                            // res.json(deleteStatus);
                            let del_success = deleteStatus[0][0].DEL_SUCCESS
                            // res.json(del_success);
                            if(del_success === 1) {
                                res.json({deleteStatus:del_success, message:"Successfull deleted"})
                            }
                            else {
                                res.json({deleteStatus:del_success, message:"ID not found"})
                            }
                        }
                    })
                }
            })
        }
    })
})

server.put('/tweets', (req,res) => {
    let tweetID = req.body.tweetID;
    let tweet = req.body.tweet;
    let tweet_img = req.body.tweet_img;
    let query = "CALL `editTweet`(?, ?, ?)"
    db.query(query, [tweetID,tweet,tweet_img],(error,editDate) => {
        if(error) {
            res.json({editTweet:false, message:error});
        }
        else {
            res.json({editTweet:editDate[0][0], message:"Success update"});
        }
    })
})



server.listen(4400, function(){
    console.log('Server is successfully running on port 4400')
})