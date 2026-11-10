'use client'

import { useMemo, useState } from 'react'
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl('/maplibre-gl-worker.mjs')

const DAM = { longitude: 76.5724, latitude: 12.4244 }
const CITY = { longitude: 77.5946, latitude: 12.9716 }
const initialView = { ...DAM, zoom: 9.15, pitch: 68, bearing: -12 }

const riverCoordinates = Array.from({ length: 221 }, (_, index) => {
  const t = index / 220
  return [DAM.longitude + t * 1.0222 + Math.sin(t * 38) * 0.018, DAM.latitude + t * 0.5472 + Math.sin(t * 22) * 0.016] as [number, number]
})
const river = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: riverCoordinates } } as const
const reservoirCoordinates = Array.from({ length: 72 }, (_, index) => {
  const angle = (index / 72) * Math.PI * 2
  const radiusX = 0.13 + Math.sin(index * 2.1) * 0.018
  const radiusY = 0.085 + Math.cos(index * 1.7) * 0.014
  return [76.60 + Math.cos(angle) * radiusX, 12.445 + Math.sin(angle) * radiusY] as [number, number]
})
reservoirCoordinates.push(reservoirCoordinates[0])
const reservoir = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [reservoirCoordinates] } } as const
const wards = { type: 'FeatureCollection', features: [
  [[77.51,12.98],[77.58,12.98],[77.58,13.03],[77.51,13.03],[77.51,12.98]],
  [[77.59,12.91],[77.68,12.91],[77.68,12.99],[77.59,12.99],[77.59,12.91]],
  [[77.55,12.96],[77.62,12.96],[77.62,13.02],[77.55,13.02],[77.55,12.96]],
].map((coordinates, index) => ({ type: 'Feature', properties: { tier: ['Moderate','High','Critical'][index] }, geometry: { type: 'Polygon', coordinates: [coordinates] } })) } as const

const style = { version: 8 as const, sources: {
  satellite: { type: 'raster' as const, tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri World Imagery' },
  terrain: { type: 'raster-dem' as const, tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium' as const, tileSize: 256, maxzoom: 15 },
  buildings: { type: 'vector' as const, tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'], maxzoom: 14 },
}, layers: [{ id: 'satellite', type: 'raster' as const, source: 'satellite', paint: { 'raster-saturation': -0.18, 'raster-contrast': 0.12, 'raster-brightness-max': 0.86 } }], terrain: { source: 'terrain', exaggeration: 1.8 }, sky: { 'sky-color': '#102326', 'sky-horizon-blend': 0.34, 'horizon-color': '#78918a', 'horizon-fog-blend': 0.34, 'fog-color': '#365b5a', 'fog-ground-blend': 0.62 } as never }

export function HdreMapScene({ progress = 0, simulator = false, rainfall = 0, onFly }: { progress?: number; simulator?: boolean; rainfall?: number; onFly?: (target: typeof DAM | typeof CITY) => void }) {
  const [mapFailed, setMapFailed] = useState(false)
  const view = useMemo(() => ({ ...initialView, latitude: DAM.latitude + progress * (CITY.latitude - DAM.latitude), longitude: DAM.longitude + progress * (CITY.longitude - DAM.longitude), zoom: 9.15 + progress * 0.82 }), [progress])
  if (mapFailed) return <div className="scene-fallback" role="img" aria-label="Satellite view of the Cauvery basin"><span className="lite-tag">Lite mode · satellite fallback</span><div className="fallback-marker fallback-dam">KRS DAM</div><div className="fallback-marker fallback-city">BENGALURU</div></div>
  return <div className="map-scene"><Map {...view} mapStyle={style} onError={() => setMapFailed(true)} attributionControl={false} reuseMaps maxPitch={85} mapLib={import('maplibre-gl')}>
    <Source id="reservoir" type="geojson" data={reservoir}><Layer id="reservoir-fill" type="fill" paint={{ 'fill-color': '#2f95aa', 'fill-opacity': ['interpolate',['linear'],['zoom'],8,0.42,13,0.68], 'fill-antialias': true }} /><Layer id="reservoir-outline" type="line" paint={{ 'line-color': '#8ed7d4', 'line-opacity': 0.42, 'line-width': 1.5 }} /></Source>
    <Source id="river" type="geojson" data={river}><Layer id="river-halo" type="line" paint={{ 'line-color': '#65bbc4', 'line-width': ['interpolate',['linear'],['zoom'],8,5,13,18], 'line-opacity': 0.18, 'line-blur': 5 }} /><Layer id="river-line" type="line" paint={{ 'line-color': '#83ced1', 'line-width': ['interpolate',['linear'],['zoom'],8,2,13,9], 'line-opacity': 0.84, 'line-blur': 0.8 }} /></Source>
    <Source id="wards" type="geojson" data={wards}><Layer id="ward-extrusions" type="fill-extrusion" paint={{ 'fill-extrusion-color': ['match',['get','tier'],'Critical','#e56b4e','High','#e1a34f','Moderate','#e4c96b','#77b79c'], 'fill-extrusion-height': ['match',['get','tier'],'Critical',420,'High',280,'Moderate',150,80], 'fill-extrusion-opacity': 0.48 }} /></Source>
    <Layer id="buildings" type="fill-extrusion" source="buildings" source-layer="building" minzoom={13} paint={{ 'fill-extrusion-color': '#8ea6a1', 'fill-extrusion-height': ['coalesce',['get','render_height'],18], 'fill-extrusion-opacity': 0.34 }} />
    <Marker longitude={DAM.longitude} latitude={DAM.latitude} anchor="bottom"><span className="map-marker"><i />KRS DAM</span></Marker><Marker longitude={CITY.longitude} latitude={CITY.latitude} anchor="bottom"><span className="map-marker city-marker"><i />BENGALURU</span></Marker>
    {[{longitude:77.62,latitude:12.96,label:'Victoria Hospital'},{longitude:77.57,latitude:13.02,label:'NIMHANS'}].map((hospital)=><Marker key={hospital.label} {...hospital}><span className="hospital-marker" title={hospital.label}>+</span></Marker>)}
    <NavigationControl position={simulator ? 'bottom-right' : 'top-right'} showCompass={false} />
  </Map><div className="scene-wash" style={{ opacity: simulator ? 0.08 + rainfall * 0.18 : 0.2 }} /><div className="scene-latlong">{view.latitude.toFixed(4)}° N &nbsp; {view.longitude.toFixed(4)}° E</div><span className="lite-tag map-tag">LIVE TERRAIN · ESRI / AWS</span>{simulator && <div className="map-fly-controls"><button onClick={() => onFly?.(DAM)}>Fly to dam</button><button onClick={() => onFly?.(CITY)}>Fly to city</button></div>}</div>
}
