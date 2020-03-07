const path = require("path");
const fs = require("fs");
const fetch = require("isomorphic-unfetch");
const download = require("download");
const _ = require("lodash");
require("colors");

console.log("APP starts".yellow);

const token = `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjA5MWNhOGJiYzBiZTg3YWM2OWZjMjRlOGIyNTI3NmU5NjVlZWQwMzFlZTRjMTY5ZjNlZGU2ZGVkOTUwNTI3YjA5ZTc2OWZlZDU3YzQ5NGQ0In0.eyJhdWQiOiIxMyIsImp0aSI6IjA5MWNhOGJiYzBiZTg3YWM2OWZjMjRlOGIyNTI3NmU5NjVlZWQwMzFlZTRjMTY5ZjNlZGU2ZGVkOTUwNTI3YjA5ZTc2OWZlZDU3YzQ5NGQ0IiwiaWF0IjoxNTgzNjA5MTAwLCJuYmYiOjE1ODM2MDkxMDAsImV4cCI6MTYxNTE0NTEwMCwic3ViIjoiMTAxOTkiLCJzY29wZXMiOltdfQ.EIPZleXhC64FOzoXNmmouTdRto8S8BOhSaQZIiOZzqThK6As6jYiFdpIkbyWeT2lAmQ1BBel47CKo7rJXVbIK61GRD1mAJalRF1geLukKcAJvqWQi227ld9Ka2LjEv6r9wKPSWFtN9j0O2EdlpQ0qf_xkM2DEsFBFf8EZj8KnpM5sdiN4XWLVzn4MSv7lEJZRkrOd1hAVy7VPfIbb2ML35TAoeKLJkyXkzgt8TRAEcC774UR-MGWSI4WXzY85kszp3FeIaIkWP8dcxkx4betad-imJOMDgGHGmxvHbf1srNPue3uk_crjIHhLrGCLWeo4VBxdjyWUWFYWP_vgZK85z5ZWm5n5swh7MP_pLUqFWjDkaQe5IDK7o29QnkV6ZmWCVOU1R2MqybYGqXuOpaUCQwhJWfR4CRG3EvN9cNUSFmvlg-Og7uGmjXfecZEC6Qv_AbY5MLPLcJgk5HbIgu46i8ODxfIllMX-Yes0t95TN1WB-Qb_89S5XSQoyhTrpj5HNP4C9BYXVZY7OHAGe6PvIGxRXaRLVfvlRlYTfKb7N_jaguNLD7T9Zp2fvOEDD_lPBU_tbh-lW0Nmlzh3Wr9yiqtg4ascJtCEdzfxaAD1qf_yd4cR96xLf84JF-8Qs8jY5VauXpnVLem7Ueu75e28Nj4oDwZzxXEltFaMq8oPLQ`;

const getSongName = ({ name_eng, name_mm }) =>
  (name_eng ? name_eng : name_mm) || "";

const getSongNameFull = ({ str_artists, songName }) =>
  `${"" + str_artists} - ${"" + songName}.mp3`;

(async () => {
  let urls = [];
  for (let index = 1000; index <= 1088; index++) {
    urls.push(`https://melomm.com/api/v2/song?page=${index}`);
  }

  console.log("URLs generated".yellow);

  for (const url of urls) {
    console.log("PAGE fetching starts ".yellow, url);
    // const { data = [] } = await (await fetch(url)).json();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,my;q=0.8,es;q=0.7",
        "api-key":
          "yC5wfrIBSh7hrIHd4tvPmsAdId0cQwqkQjf3frqtdCP5Sd7Kbj2tGjyDCp4vJrgB",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjA5MWNhOGJiYzBiZTg3YWM2OWZjMjRlOGIyNTI3NmU5NjVlZWQwMzFlZTRjMTY5ZjNlZGU2ZGVkOTUwNTI3YjA5ZTc2OWZlZDU3YzQ5NGQ0In0.eyJhdWQiOiIxMyIsImp0aSI6IjA5MWNhOGJiYzBiZTg3YWM2OWZjMjRlOGIyNTI3NmU5NjVlZWQwMzFlZTRjMTY5ZjNlZGU2ZGVkOTUwNTI3YjA5ZTc2OWZlZDU3YzQ5NGQ0IiwiaWF0IjoxNTgzNjA5MTAwLCJuYmYiOjE1ODM2MDkxMDAsImV4cCI6MTYxNTE0NTEwMCwic3ViIjoiMTAxOTkiLCJzY29wZXMiOltdfQ.EIPZleXhC64FOzoXNmmouTdRto8S8BOhSaQZIiOZzqThK6As6jYiFdpIkbyWeT2lAmQ1BBel47CKo7rJXVbIK61GRD1mAJalRF1geLukKcAJvqWQi227ld9Ka2LjEv6r9wKPSWFtN9j0O2EdlpQ0qf_xkM2DEsFBFf8EZj8KnpM5sdiN4XWLVzn4MSv7lEJZRkrOd1hAVy7VPfIbb2ML35TAoeKLJkyXkzgt8TRAEcC774UR-MGWSI4WXzY85kszp3FeIaIkWP8dcxkx4betad-imJOMDgGHGmxvHbf1srNPue3uk_crjIHhLrGCLWeo4VBxdjyWUWFYWP_vgZK85z5ZWm5n5swh7MP_pLUqFWjDkaQe5IDK7o29QnkV6ZmWCVOU1R2MqybYGqXuOpaUCQwhJWfR4CRG3EvN9cNUSFmvlg-Og7uGmjXfecZEC6Qv_AbY5MLPLcJgk5HbIgu46i8ODxfIllMX-Yes0t95TN1WB-Qb_89S5XSQoyhTrpj5HNP4C9BYXVZY7OHAGe6PvIGxRXaRLVfvlRlYTfKb7N_jaguNLD7T9Zp2fvOEDD_lPBU_tbh-lW0Nmlzh3Wr9yiqtg4ascJtCEdzfxaAD1qf_yd4cR96xLf84JF-8Qs8jY5VauXpnVLem7Ueu75e28Nj4oDwZzxXEltFaMq8oPLQ",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token": "GvPMVHfAhmmPBw2UDue9H0WEjAeGSFtuDO0w4cnK",
        "x-requested-with": "XMLHttpRequest",
        "x-xsrf-token":
          "eyJpdiI6Im1DT3EzYmNsbmtGbGN1aTRCSWJvN1E9PSIsInZhbHVlIjoiSENqYXh0RktieTgyb1htS3B3cmtrUDhpeUZBUEIzWHdGdGtGb2E5aklhcG1HZXZUMitrM1lxSXFTMTZlVUwrXC8iLCJtYWMiOiI2MjkyNmI0OTcwYzlkZTY5NmUxYjJjZmQyYzBhOWNhZjdkMmYxNWYwZWMxNWE4N2Q3NmFmMWExYWUxN2M5MmIwIn0="
      }
    });
    if (!response.ok) {
      console.log("ERROR ".red, "Fetching Songs List Failed at ", url);
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
