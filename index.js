const path = require("path");
const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const download = require("download");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const keys = require("./keys");
require("colors");

console.log("APP starts".yellow);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: keys.mail,
    pass: keys.password
  }
});

const getSongName = ({ name_eng, name_mm }) =>
  (name_eng ? name_eng : name_mm) || "";

const getSongNameFull = ({ str_artists, songName }) =>
  `${"" + str_artists} - ${"" + songName}.mp3`;

(async () => {
  let urls = [];
  for (let index = 300; index <= 1088; index++) {
    urls.push(`https://melomm.com/api/v2/song?page=${index}`);
  }

  console.log("URLs generated".yellow);

  for (const url of urls) {
    console.log("PAGE fetching starts ".yellow, url);
    // const { data = [] } = await (await fetch(url)).json();
    const response = await fetch(url, {
      method: "GET",
      headers: keys.headers
    });
    if (!response.ok) {
      console.log("ERROR FETCHING SONG LISTS FAILED AT ".red, url);
      console.log("RESPONSE STATUS IS ".yellow, response.status);
      const mailOptions = {
        from: keys.mail,
        to: "softcraftkmh@gmail.com",
        subject: "MELO DL ERROR",
        html: `
        <p>ERROR FETCHING SONG LISTS FAILED AT: ${url}</p>
        <p>RESPONSE STATUS IS: ${response.status}</p>
        `
      };
      transporter.sendMail(mailOptions);
    } else {
      const { data = [] } = await response.json();
      console.log("PAGE fetching done ".blue, url);
      const existingFiles = fs.readdirSync(path.join(__dirname, "/dist"));
      const songs = data
        .filter(({ full_file, str_artists, name_eng, name_mm }) => {
          const songName = getSongName({ name_eng, name_mm });
          const songNameFull = getSongNameFull({ str_artists, songName });
          if (
            full_file &&
            str_artists &&
            songName &&
            !existingFiles.find(file => file === songNameFull)
          ) {
            return true;
          } else {
            console.log("SONG ALREADY EXISTS ".red, songNameFull);
            return false;
          }
        })
        .map(({ full_file, str_artists, name_eng, name_mm }) => {
          const songName = getSongName({ name_eng, name_mm });
          const songNameFull = getSongNameFull({ str_artists, songName });
          return {
            songNameFull,
            fileUrl: full_file
          };
        });

      try {
        if (!_.isEmpty(songs)) {
          await Promise.all(
            songs.map(({ fileUrl, songNameFull }) => {
              return new Promise((resolve, reject) => {
                console.log("DOWNLOAD STARTS OF ".yellow, songNameFull);
                download(fileUrl)
                  .then(data => {
                    fs.writeFile(
                      path.join(__dirname, "dist/", songNameFull),
                      data,
                      err => {
                        if (err) reject(err);
                        else {
                          console.log(
                            "SUCCESSFULLY SAVED of ".green,
                            songNameFull
                          );
                          resolve();
                        }
                      }
                    );
                  })
                  .catch(error => reject(error));
              });
            })
          );
        }
      } catch (error) {
        console.log("ERROR ".red, error);
      }
    }
  }
})();
