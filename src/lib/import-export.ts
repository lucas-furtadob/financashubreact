export interface ParsedCSV {
	headers: string[];
	rows: string[][];
}

export function parseCSV(content: string): ParsedCSV {
	const lines = content.split(/\r?\n/).filter((l) => l.trim());
	if (lines.length < 2) return { headers: [], rows: [] };

	const firstLine = lines[0];
	const semicolonCount = (firstLine.match(/;/g) || []).length;
	const commaCount = (firstLine.match(/,/g) || []).length;
	const delimiter = semicolonCount >= commaCount ? ";" : ",";

	const headers = firstLine
		.split(delimiter)
		.map((h) => h.trim().replace(/^"|"$/g, ""));
	const rows = lines.slice(1).map((line) => {
		const values: string[] = [];
		let current = "";
		let inQuotes = false;
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === delimiter && !inQuotes) {
				values.push(current.trim().replace(/^"|"$/g, ""));
				current = "";
			} else {
				current += char;
			}
		}
		values.push(current.trim().replace(/^"|"$/g, ""));
		values.push(current.trim().replace(/^"|"$/g, ""));
		return values;
	});

	return { headers, rows };
}

export function parseOFX(content: string) {
	const transactions: {
		data: string;
		titulo: string;
		valor: number;
		tipo: "receita" | "despesa";
	}[] = [];

	const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;

	while (true) {
		const match = stmtTrnRegex.exec(content);
		if (!match) break;
		const trn = match[1];
		const getTag = (tag: string) => {
			const regex = new RegExp(`<${tag}>([^<\\n]+)`, "i");
			const m = trn.match(regex);
			return m ? m[1].trim() : "";
		};

		const dtposted = getTag("DTPOSTED");
		const trnamt = getTag("TRNAMT");
		const name = getTag("NAME") || getTag("MEMO") || "";

		if (!dtposted || !trnamt) continue;

		let data = "";
		const dateMatch = dtposted.match(/(\d{4})(\d{2})(\d{2})/);
		if (dateMatch) {
			data = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
		} else if (dtposted.length >= 8) {
			const yyyy = dtposted.substring(0, 4);
			const mm = dtposted.substring(4, 6);
			const dd = dtposted.substring(6, 8);
			data = `${dd}/${mm}/${yyyy}`;
		}

		const valor = parseFloat(trnamt.replace(",", "."));
		const tipo = valor >= 0 ? "receita" : "despesa";

		transactions.push({
			data,
			titulo: name,
			valor: Math.abs(valor),
			tipo,
		});
	}

	return transactions;
}

export function exportToCSV(
	headers: string[],
	rows: (string | number)[][],
	filename: string,
) {
	const BOM = "\uFEFF";
	const csvContent =
		BOM +
		headers.join(";") +
		"\n" +
		rows
			.map((row) =>
				row
					.map((cell) => {
						const str = String(cell);
						return str.includes(";") || str.includes('"') || str.includes("\n")
							? `"${str.replace(/"/g, '""')}"`
							: str;
					})
					.join(";"),
			)
			.join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	downloadBlob(blob, filename);
}

export function exportToXLS(
	headers: string[],
	rows: (string | number)[][],
	filename: string,
) {
	let xlsContent =
		'<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Lancamentos"><Table>';

	xlsContent +=
		"<Row>" +
		headers
			.map((h) => `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`)
			.join("") +
		"</Row>";

	rows.forEach((row) => {
		xlsContent += "<Row>";
		row.forEach((cell, idx) => {
			const type = idx === 4 ? "Number" : "String";
			xlsContent += `<Cell><Data ss:Type="${type}">${escapeXML(String(cell))}</Data></Cell>`;
		});
		xlsContent += "</Row>";
	});

	xlsContent += "</Table></Worksheet></Workbook>";

	const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel" });
	downloadBlob(blob, filename);
}

function escapeXML(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

export function downloadTemplate() {
	const template =
		"Data;Titulo;Valor;Categoria;Forma Pagamento;Tag;Status\n01/01/2024;Lancamento Exemplo;-100,00;Alimentacao;;;\n15/01/2024;Recebimento;500,00;Vendas de Produtos;;;";
	const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
	downloadBlob(blob, "modelo_importacao.csv");
}
