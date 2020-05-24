# COMP20 Semester Group Project Team 14
Phan Nguyen, Jacqueline Nguyen, Eric (Kyoungduk) Park, Matthew Park,
Ilya Yurchenko

## Project title

GOD JAMMIT

## Introduction

God-Jammit is a live music streaming/jamming web application written using Node.js, Socket.io, and Google's Firebase API

## Problem statement

We as musicians sometimes want to save or record our work from the small "jam" sessions. Moreover, many genres of music are collaboration based but, not everyone has the luxury of living in an area like a campus or a city, in which there are many musicians available. Even then, some people cannot always meet up regularly to produce music together.

## Solution

We will provide a MIDI interface for musicians to record their instantaneous creations of music, or share ideas with each other. Users, after registering with their Google accounts, can work on other peoples’ project remotely and add their own MIDI instruments.

## Features

1. Be able to search up available songs to collaborate on
2. Log into an account through Firebase API - needed to be able to collaborate
3. Upload and edit own music files
4. Stream/join/play along the other musicians with MIDI instruments
5. Merge/save/edit music files with songs on site

## APIs

1. MIDI API
2. Firebase API
3. TBD

## Data

1. Account data from Firebase API
2. (Optional) Music files from users
3. Musical MIDI data from MIDI API
4. (Optional) Song data from SoundCloud

## Algorithms and Techniques

1. Searching algorithms - Since our program allows users to search for and contribute to projects, we will be dealing with a lot of  	search algorithms:
	- Finding a project based off of key search words
	- Fetching projects from the database every time a user logs in
2. Cryptographic algorithm for login credentials:
	- Logging in and out credentials will be dealt with via external authentication (via Facebook or Google) using the Firebase API
3. Cutting/ add/ modification of projects:
 	- Algorithms and techniques needed is encapsulated in the MIDI API which allows us to cut, add, modify (change tone, keep certain frequencies) the music file.

## URL 

https://god-jammit.herokuapp.com
