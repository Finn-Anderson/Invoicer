const { exists, readFile, create, open, BaseDirectory } = window.__TAURI__.fs;

export const dbdata = "dbdata", display = "display";

export async function read(filename) {
	let data = await readFile(filename, { baseDir: BaseDirectory.AppLocalData });

	let decodedData = new TextDecoder().decode(data);
	let parsedData = decodedData.split(",");

	return parsedData;
}

export async function fileExists(filename, bCreate = false, location = "") {
	const status = await exists(filename, { baseDir: BaseDirectory.AppLocalData });

	if (!status) {
		if (bCreate)
			await create(filename, { baseDir: BaseDirectory.AppLocalData });

		if (location)
			window.location.href = location;
	}

	return status;
}

export async function updateFile(filename, data) {
	try {
		const status = await fileExists(filename);
		let file = null;

		if (!status)
			file = await create(filename, { baseDir: BaseDirectory.AppLocalData });
		else
			file = await open(filename, { write: true, truncate: true, baseDir: BaseDirectory.AppLocalData });

		await file.write(new TextEncoder().encode(data));
		await file.close();
		
		return true;
	} catch(error) {
		return false;
	}
}