import { read, fileExists, updateFile } from "./includes/file.js";

document.querySelectorAll(".presetBtn").forEach(element => {
	element.addEventListener("click", async () => {
		const filename = element.name;
		const parent = element.parentElement;
		const container = parent.querySelector(".presetContainer");

		const parsedData = await read(filename);

		for (const data of parsedData) {
			const button = document.createElement("button");
			button.innerHTML = data[0];
			button.onclick = () => {
				parent.querySelector("input").value = data[0];
			}
			container.appendChild(button);
		}
	}, false);
});

document.querySelectorAll(".presetSave").forEach(element => {
	element.onclick = async (event) => {
		const filename = event.target.name;
		const parent = event.target.parentElement.parentElement.parentElement.parentElement;
		const container = event.target.parentElement.parentElement.parentElement.parentElement.querySelector(".tableDataContainer");
		const title = event.target.parentElement.parentElement.querySelector("input").value;

		const message = parent.querySelector("#message");
		message.classList.remove(...message.classList);
		if (title == "") {
			message.classList.add("failure");
			message.innerHTML = "Invalid title";

			return;
		}
		
		let inputs = [];
		for (const input of container.querySelectorAll("input")) {

			let value = input.name + ":";
			if (input.type == "checkbox")
				value += input.checked;
			else
				value += input.value;

			inputs.push(value);
		}

		for (const select of container.querySelectorAll("select"))
			inputs.push((select.name + ":" + select.value));

		const saveData = [title, inputs];
		await fileExists(filename, true);
		let parsedData = await read(filename);

		let bReplaced = false;
		for (let i = 0; i < parsedData.length; i++) {
			if (parsedData[i][0] != title)
				continue;

			parsedData[i] = saveData;
			bReplaced = true;
			break;
		}

		if (!bReplaced)
			parsedData.push(saveData);

		await updateFile(filename, parsedData);

		message.classList.add("success");
		message.innerHTML = "Saved preset";
	};
});

document.querySelectorAll(".presetLoad").forEach(element => {
	element.onclick = async (event) => {
		const filename = event.target.name;
		const parent = event.target.parentElement.parentElement.parentElement.parentElement;
		const title = event.target.parentElement.parentElement.querySelector("input").value;

		await fileExists(filename, true);
		const parsedData = await read(filename);

		let data = null;
		for (const value of parsedData) {
			if (value[0] != title)
				continue;

			data = value;
			break;
		}
		
		const message = parent.querySelector("#message");
		message.classList.remove(...message.classList);
		if (data == null) {
			message.classList.add("failure");
			message.innerHTML = "Invalid title";

			return;
		}

		for (const value of data[1]) {
			const v = value.split(":");
			const element = parent.querySelector("input[name = '"+ v[0] + "']");

			if (!(element instanceof HTMLElement))
				continue;

			if (element.type == "checkbox")
				element.checked = v[1] == "true" ? true : false;
			else
				element.value = v[1];
		}

		message.classList.add("success");
		message.innerHTML = "Loaded preset";
	};
});