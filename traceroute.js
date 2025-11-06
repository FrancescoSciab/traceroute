// traceroute.js
const map = L.map("map").setView([53.3, -6.2], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

async function traceTo(host) {
  const res = await fetch(`https://api.hackertarget.com/mtr/?q=${host}`);
  const hops = (await res.text()).trim().split("\n").slice(1);

  let polyline = [];
  for (let line of hops) {
    const [hop, ip, loss, rtt] = line.split(/\s+/).filter(Boolean);
    if (!ip || ip === "???") continue;

    const geo = await fetch(`https://ipapi.co/${ip}/json/`).then((r) =>
      r.json()
    );
    const lat = geo.latitude,
      lon = geo.longitude;
    if (!lat) continue;

    polyline.push([lat, lon]);
    L.circleMarker([lat, lon], {
      radius: 6,
      color: loss === "0.0%" ? "green" : "red",
    })
      .addTo(map)
      .bindPopup(
        `Hop ${hop}<br>IP: ${ip}<br>Loss: ${loss}<br>RTT: ${rtt}ms<br>ASN: ${geo.org}`
      );
  }
  L.polyline(polyline, { color: "#1a73e8", weight: 4, opacity: 0.8 }).addTo(
    map
  );
  map.fitBounds(polyline);
}
