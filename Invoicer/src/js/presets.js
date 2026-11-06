import { read } from "./includes/file.js";

document.querySelectorAll(".presetBtn").onclick = async (event) => {
	const filename = event.target.name;
	const popup = event.target.parentElement.querySelector(".tableNavPopup");

	const parsedData = await read(filename);
	for (const data of parsedData) {
		// add button per parsedData. Layout looks like this ["Title", ["checkbox1", "checkbox2", "input1:value"]]
	}
}