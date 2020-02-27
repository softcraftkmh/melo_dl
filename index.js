const path = require("path");
const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const download = require("download");
const _ = require("lodash");
require("colors");

console.log("APP starts".yellow);

const getSongName = ({ name_eng, name_mm }) =>
  (name_eng ? name_eng : name_mm) || "";

const getSongNameFull = ({ str_artists, songName }) =>
  `${"" + str_artists} - ${"" + songName}.mp3`;

(async () => {
  let urls = [];
  for (let index = 1; index <= 1088; index++) {
    urls.push(`https://melomm.com/api/v2/song?page=${index}`);
  }

  console.log("URLs generated".yellow);

  for (const url of urls) {
    console.log("PAGE fetching starts ".yellow, url);
    const { data = [] } = await (await fetch(url)).json();
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
})();
