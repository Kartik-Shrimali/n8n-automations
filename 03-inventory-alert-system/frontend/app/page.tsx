"use client";

import { useEffect, useState } from "react";

type Product = {
  row_number: number;
  "PRODUCT NAME": string;
  "CURRENT STOCK": number;
  "REORDER THRESHOLD": number;
  PRICE: number;
  "LAST UPDATED": string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const placeOrder = async () => {
    if (!selectedProduct) return;
    setPlacing(true);
    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: selectedProduct,
        quantityOrdered: quantity,
      }),
    });
    setPlacing(false);
    fetchInventory();
  };

  if (loading) return <p className="p-8">Loading inventory...</p>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Inventory Dashboard</h1>
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Product</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Threshold</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const low = p["CURRENT STOCK"] < p["REORDER THRESHOLD"];
            return (
              <tr key={p.row_number} className="border-b">
                <td className="py-2">{p["PRODUCT NAME"]}</td>
                <td className="py-2">{p["CURRENT STOCK"]}</td>
                <td className="py-2">{p["REORDER THRESHOLD"]}</td>
                <td className={`py-2 font-medium ${low ? "text-red-600" : "text-green-600"}`}>
                  {low ? "Low Stock" : "OK"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Simulate Order</h2>
        <div className="flex gap-3 items-center">
          <select
            className="border rounded px-3 py-2 bg-black"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.row_number} value={p["PRODUCT NAME"]}>
                {p["PRODUCT NAME"]}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded px-3 py-2 w-20 bg-black"
          />
          <button
            onClick={placeOrder}
            disabled={placing}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </main>
  );
}