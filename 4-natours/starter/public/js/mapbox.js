/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmlsaGVsbXMtYmFsb2RpcyIsImEiOiJjbGsyYnFuanEwN3NqM2twa3FyYWpiM3dwIn0.aj4s-Ez-p8ss1rre3fV5Eg';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vilhelms-balodis/clk2c1lbo00cy01qy0anmderl',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // add marker
    new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(loc.coordinates).addTo(map);
    // add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // extend bounds to add current locations
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, { padding: { top: 200, bottom: 150, left: 200, right: 200 } });
};
