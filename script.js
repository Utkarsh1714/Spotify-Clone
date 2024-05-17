// const url = 'https://spotifystefan-skliarovv1.p.rapidapi.com/addTracksToPlaylist';
// const options = {
// 	method: 'POST',
// 	headers: {
// 		'content-type': 'application/x-www-form-urlencoded',
// 		'X-RapidAPI-Key': 'c8ac31eebdmsh3f6b885bb636766p1f8aa3jsnc5e8dce56290',
// 		'X-RapidAPI-Host': 'Spotifystefan-skliarovV1.p.rapidapi.com'
// 	},
// 	body: new URLSearchParams({
// 		userId: '<REQUIRED>',
// 		accessToken: '<REQUIRED>',
// 		playlistId: '<REQUIRED>'
// 	})
// };

// async function main() {
//     const response = await fetch(url, options);
// 	const result = await response.text();
// 	console.log(result);
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let tds = div.getElementsByTagName("td");
//     console.log(tds);
// }
// main();

// // async function main() {
// //     try {
// //         const response = await fetch(url, options);
// //         const result = await response.text();
// //         console.log(result);
// //     } catch (error) {
// //         console.error(error);
// //     }
// // }
// // main();

let play = document.querySelector(".playBtn");
const ctx = new AudioContext();

let audio = [];

async function main(){
    let response1 = await fetch("./songs/Dil-Ibadat.mp3");
    let song1 = await song1.json();
    audio[0] = song1;

    let response2 = await fetch("./songs/Khuda-Jaane.mp3");
    let song2 = await song2.json();
    audio[1] = song2;
}
main();

async function main1(){
    let response2 = await fetch("./songs/Khuda-Jaane.mp3");
    let song2 = await song2.json();
    audio[1] = song2;
}
main1();



audio[3] = fetch("./songs/Maula-Mere-Maula.mp3");
audio[4] = fetch("./songs/Tujhe-Sochta-Hoon.mp3");

console.log(audio);