
import { display, read } from "./includes/file.js";

const ol = document.querySelector("ol");
setTimeout(() => {
	const inputs = document.querySelectorAll("input[type='checkbox']");
	for (const input of inputs) {
		input.addEventListener("change", () => {
			if (input.checked) {
				const li = document.createElement("li");
				li.innerHTML = input.name;
				ol.appendChild(li);
			}
			else {
				for (const li of ol.children) {
					if (li.innerHTML != input.name)
						continue;

					ol.removeChild(li);

					return;
				}
			}
		}, false);
	}
}, 100);

document.getElementById("printSubmit").onclick = async () => {
	try {
		const title = document.getElementById("title");

		const parsedData = await read(display);

		if (title.value == "") {
			message.classList.add("failure");
			message.innerHTML = "Please add a title";

			return;
		}

		let list = [];
		for (const element of ol.children)
			list.push(element.innerHTML);
		
		if (list.length == 0) {
			message.classList.add("failure");
			message.innerHTML = "Please select at least one column";

			return;
		}

		const printTable = document.createElement("table");
		const table = document.getElementById("table").cloneNode(true);
		const rows = table.querySelectorAll("tr");

		for (const row of rows)
			printTable.appendChild(document.createElement("tr"));

		let totals = {};

		for (const name of list) {
			if (name == "Row Total") {
				let bShowTally = false;
				let tally = 0;

				for (let i = 0; i < rows.length; i++) {
					if (i == 0) {
						const th = document.createElement("th");
						th.innerHTML = "Total (" + parsedData[3] + ")";
						printTable.children[i].appendChild(th);
					}
					else {
						const td = document.createElement("td");
						td.classList.add("tdCurrency");
						
						let total = 0;
						for (let j = 0; j < rows[i].children.length; j++ ) {
							const data = rows[i].children[j];
							const dataValue = data.title != "" ? data.title.substring(1, data.title.length) : data.innerHTML;
							if (isNaN(parseFloat(dataValue)) || !isFinite(dataValue) || !list.includes(rows[0].children[j].innerHTML) || (!rows[0].children[j].innerHTML.includes(parsedData[3]) && !data.title.includes(parsedData[3])))
								continue;

							let value = parseFloat(dataValue);

							if (data.dataset.name == "paid")
								total -= value;
							else
								total += value;

							bShowTally = true;
						}
						td.innerHTML = total.toFixed(2);
						tally += total;

						printTable.children[i].appendChild(td);
					}
				}

				if (bShowTally)
					totals[name] = tally.toFixed(2);
			}
			else {
				let bShowTally = false;
				let tally = 0;

				for (let i = rows[0].children.length - 1; i > -1; i--) {
					const th = rows[0].children[i].cloneNode(true);

					if (name != th.innerHTML)
						continue;

					if (th.innerHTML == "Paid")
						th.innerHTML += " (" + parsedData[3] + ")";

					printTable.children[0].appendChild(th);

					for (let j = 1; j < rows.length; j++) {
						const td = rows[j].children[i].cloneNode(true);
						if (td.title != "") {
							td.innerHTML = td.title.substring(1, td.title.length);
							td.classList.remove(...td.classList);
							td.classList.add("tdCurrency");
						}

						printTable.children[j].appendChild(td);

						if (!isNaN(parseFloat(td.innerHTML)) && isFinite(td.innerHTML) && th.innerHTML.includes(parsedData[3])) {
							let value = parseFloat(td.innerHTML);

							if (td.dataset.name == "paid")
								tally -= value;
							else
								tally += value;

							bShowTally = true;
						}
					}
				}

				if (bShowTally)
					totals[name] = tally.toFixed(2);
			}
		}

		if (list.includes("Tally Total")) {
			const tr = document.createElement("tr");

			for (const name of list) {
				if (name == "Tally Total")
					continue;

				const td = document.createElement("td");

				if (name in totals) {
					td.classList.add("tdCurrency");
					td.innerHTML = totals[name];
				}
				else if (list[0] == name) {
					td.style.fontWeight = "bold";
					td.style.textAlign = "left";
					td.innerHTML = "Totals";
				}

				tr.appendChild(td);
			}

			printTable.appendChild(tr);
		}

		const main = document.querySelector("iframe").contentDocument.querySelector("main");
		if (main.querySelector("table"))
			main.querySelector("table").remove();
		main.querySelectorAll("h1")[0].innerHTML = parsedData[2];
		main.querySelectorAll("h1")[1].innerHTML = title.value;
		main.appendChild(printTable);

		window.print();
	} catch(error) {
		console.log(error);
	}
}