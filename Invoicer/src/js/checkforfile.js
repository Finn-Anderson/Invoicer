const { exists, BaseDirectory } = window.__TAURI__.fs;

let status = await exists("dbdata", { baseDir: BaseDirectory.AppLocalData });

if (!status)
	window.location.href = "../settings.html";