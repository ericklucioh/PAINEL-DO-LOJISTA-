import { Socket } from "node:net";
import { env } from "../../config/env";
import type { SaleDto } from "./sales.schema";

export interface ReceiptPrinter {
    print(receipt: string): Promise<void>;
}

function formatMoney(value: number): string {
    return value.toFixed(2).replace(".", ",");
}

function line(content: string = ""): string {
    return `${content}\n`;
}

export function buildReceiptText(sale: SaleDto): string {
    const rows = [
        line("PAINEL DO LOJISTA"),
        line(`RECIBO #${sale.receiptNumber}`),
        line(`DATA: ${sale.createdAt}`),
        line(`VENDEDOR: ${sale.soldByUserName}`),
        line("--------------------------------"),
    ];

    for (const item of sale.items) {
        rows.push(line(item.productNameSnapshot));
        rows.push(
            line(
                `${item.quantity} x ${formatMoney(item.unitPriceSnapshot)} = ${formatMoney(item.subtotal)}`,
            ),
        );
        rows.push(line(`EAN: ${item.productEanSnapshot}`));
        rows.push(line("--------------------------------"));
    }

    rows.push(line(`SUBTOTAL: R$ ${formatMoney(sale.subtotal)}`));
    rows.push(line(`DESCONTO: R$ ${formatMoney(sale.discountAmount)}`));
    rows.push(line(`TOTAL: R$ ${formatMoney(sale.totalAmount)}`));
    rows.push(line(`PAGAMENTO: ${sale.paymentMethod}`));
    rows.push(line(`STATUS: ${sale.status}`));
    rows.push(line());

    return rows.join("");
}

async function writeToTcpPrinter(receipt: string): Promise<void> {
    const host = env.receiptPrinterHost;
    if (host === null) {
        throw new Error("Printer host is required for tcp mode");
    }

    const socket = new Socket();

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error("Printer connection timed out"));
        }, env.receiptPrinterTimeoutMs);

        socket.once("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        socket.connect(env.receiptPrinterPort, host, () => {
            socket.write(receipt, (error) => {
                clearTimeout(timeout);
                if (error) {
                    socket.destroy(error);
                    reject(error);
                    return;
                }

                socket.end(() => {
                    resolve();
                });
            });
        });
    });
}

async function writeToStdout(receipt: string): Promise<void> {
    process.stdout.write(receipt);
}

export function createReceiptPrinter(): ReceiptPrinter {
    return {
        async print(receipt: string) {
            if (env.receiptPrinterMode === "tcp") {
                await writeToTcpPrinter(receipt);
                return;
            }

            await writeToStdout(receipt);
        },
    };
}
