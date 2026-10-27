document.querySelectorAll(".addBtn").forEach(element => {
	element.addEventListener("click", displayMenu, false);
});

let popupmenu = document.getElementById("popupmenu");
let popupdata = document.getElementById("popupdata");
popupmenu.addEventListener("click", hidePopupMenu, false);
popupdata.addEventListener("submit", function(event) { submitPopupData(event.target.name); }, false);

async function displayMenu(event) {
	popupmenu.style.display = "flex";

	popupdata.innerHTML = "";

	const header = document.createElement("h2");
	header.innerHTML = event.target.innerHTML;
	popupdata.appendChild(header);

	const message = document.createElement("p");
	message.id = "message";
	popupdata.appendChild(message);

	const padvertiser = document.createElement("p");
	padvertiser.innerHTML = "Advertiser";
	popupdata.appendChild(padvertiser);
	const iadvertiser = document.createElement("input");
	iadvertiser.required = true;
	popupdata.appendChild(iadvertiser);
	// Use as search if creating invoice

	if (event.target.name == "invoice") {
		const pinvoiceno = document.createElement("p");
		pinvoiceno.innerHTML = "Invoice Number";
		popupdata.appendChild(pinvoiceno);
		const iinvoiceno = document.createElement("input");
		iinvoiceno.required = true;
		popupdata.appendChild(iinvoiceno);

		const pamount = document.createElement("p");
		pamount.innerHTML = "Amount";
		popupdata.appendChild(pamount);
		const iamount = document.createElement("input");
		iamount.type = "currency";
		iamount.required = true;
		popupdata.appendChild(iamount);

		const pvat = document.createElement("p");
		pvat.innerHTML = "VAT";
		popupdata.appendChild(pvat);
		const ivat = document.createElement("input");
		ivat.type = "currency";
		ivat.required = true;
		popupdata.appendChild(ivat);

		const pdate = document.createElement("p");
		pdate.innerHTML = "Invoice Date";
		popupdata.appendChild(pdate);
		const idate = document.createElement("input");
		idate.type = "date";
		idate.required = true;
		popupdata.appendChild(idate);

		const pduedate = document.createElement("p");
		pduedate.innerHTML = "Due Date";
		popupdata.appendChild(pduedate);
		const iduedate = document.createElement("input");
		iduedate.type = "date";
		iduedate.required = true;
		popupdata.appendChild(iduedate);
	}

	const button = document.createElement("button");
	button.type = "submit";
	button.innerHTML = "Submit";
	popupdata.appendChild(button);
}

async function submitPopupData(name) {
	const inputs = popupdata.querySelectorAll("input");

	if (name == "advertiser") {

	}
	else {

	}
}

function hidePopupMenu(event) {
	if (event.target != popupmenu)
		return;

	popupmenu.style.display = "none";
}