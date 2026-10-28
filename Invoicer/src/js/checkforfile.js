const { exists, readFile, BaseDirectory } = window.__TAURI__.fs;
const Database = window.__TAURI__.sql;

async function check() {
	let status = await exists("dbdata", { baseDir: BaseDirectory.AppLocalData });

}