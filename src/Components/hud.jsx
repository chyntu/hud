import React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import "../Styles/hud.css";
import pitchLines from "../images/pitchIndicatorLines.png";
import medianLine from "../images/medianLine.png";
import compass from "../images/compassNew.png";
import locIcon from "../images/locationIcon.png";
import planeLoc from "../images/plane.png";

const Hud = () => {
  const [data, setData] = useState({});
  const [wayPoints, setWayPoints] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  let retryCount = 0;

  useEffect(() => {
    let timeoutId;
  
    const fetchData = async () => {
      if (retryCount >= 100) {
        console.log("Maximum retries reached. Stopping further requests.");
        return;
      }
      try {
        const response = await axios.get(
          "https://missionplanner-api.onrender.com/tdata-data"
        );
        setData(response.data);
        timeoutId = setTimeout(fetchData, 5);
      } catch (error) {
        console.log("Error from Data.");
        retryCount++;
        timeoutId = setTimeout(fetchData, 5);
      }
    };
  
    fetchData();
  
    return () => clearTimeout(timeoutId);
  }, []);
  

  useEffect(() => {
    let timerId;
  
    const fetchWayPoints = async () => {
      try {
        const points = await axios.get(
          "https://missionplanner-api.onrender.com/waypoints-data"
        );
        setWayPoints(points.data);
        timerId = setTimeout(fetchWayPoints, 5); 
      } catch (error) {
        console.log("Error from WayPoints");
        timerId = setTimeout(fetchWayPoints, 5);
      }
    };
  
    fetchWayPoints();
  
    // Cleanup function to clear the timeout when the component unmounts
    return () => clearTimeout(timerId);
  }, []); // Empty dependency array to run effect only once on component mount
  

  const [vehicleHeading, setVehicleHeading] = useState(0);
  const [degree, setDegree] = useState(null);
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [c, setC] = useState(null);
  const [d, setD] = useState(null);
  const [e, setE] = useState(null);

  const [speed, setSpeed] = useState(null);
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);
  const [value3, setValue3] = useState(null);
  const [value4, setValue4] = useState(null);
  const [value5, setValue5] = useState(null);

  const [altitude, setAltitude] = useState(null);
  const [val1, setVal1] = useState(null);
  const [val2, setVal2] = useState(null);
  const [val3, setVal3] = useState(null);
  const [val4, setVal4] = useState(null);
  const [val5, setVal5] = useState(null);

  const [message, setMessage] = useState(null);

  const [pitch, setPitch] = useState(null);
  const [varPitch, setVarPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [airSpeed, setAirSpeed] = useState(null);
  const [groundSpeed, setGroundSpeed] = useState(null);
  const [mode, setMode] = useState(null);

  const mapRef = useRef(null);
  const vehicleRef = useRef(null);
  const [map, setMap] = useState(null);
  const [initialRender, setInitialRender] = useState(true);
  const [polyLine, setPolyLine] = useState(null)

  var locationIcon = L.icon({
    iconUrl: locIcon,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // point from which the popup should open relative to the iconAnchor
  });
  var planeIcon = L.icon({
    iconUrl: planeLoc,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // point from which the popup should open relative to the iconAnchor
    rotationAngle: 0,
    rotationOrigin: "50% 50%",
  });

  /* 16.2729542 80.4375805 */

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    setVehicleHeading(degree);

    // Update values of a, b, c, d, e whenever degree changes
    if (degree === 0) {
      setA(parseInt((358 - degree) % 360));
      setB(parseInt((359 - degree) % 360));
      setC(parseInt(degree % 360) === 0 ? "N" : parseInt(degree % 360));
      setD(parseInt((degree + 1) % 360));
      setE(parseInt((degree + 2) % 360));
    } else if (degree === 1) {
      setA(parseInt((360 - degree) % 360));
      setB(
        parseInt((361 - degree) % 360) === 0
          ? "N"
          : parseInt((361 - degree) % 360)
      );
      setC(parseInt(degree % 360));
      setD(parseInt((degree + 1) % 360));
      setE(parseInt((degree + 2) % 360));
    } else {
      if (parseInt((degree - 2) % 358) === 0) {
        setA("N");
      } else if (parseInt((degree - 2) % 358) === 45) {
        setA("NE");
      } else if (parseInt((degree - 2) % 358) === 90) {
        setA("E");
      } else if (parseInt((degree - 2) % 358) === 135) {
        setA("SE");
      } else if (parseInt((degree - 2) % 358) === 180) {
        setA("S");
      } else if (parseInt((degree - 2) % 358) === 225) {
        setA("SW");
      } else if (parseInt((degree - 2) % 358) === 270) {
        setA("W");
      } else if (parseInt((degree - 2) % 358) === 315) {
        setA("NW");
      } else {
        setA(parseInt((degree - 2) % 358));
      }

      if (parseInt((degree - 1) % 359) === 0) {
        setB("N");
      } else if (parseInt((degree - 1) % 359) === 45) {
        setB("NE");
      } else if (parseInt((degree - 1) % 359) === 90) {
        setB("E");
      } else if (parseInt((degree - 1) % 359) === 135) {
        setB("SE");
      } else if (parseInt((degree - 1) % 359) === 180) {
        setB("S");
      } else if (parseInt((degree - 1) % 359) === 225) {
        setB("SW");
      } else if (parseInt((degree - 1) % 359) === 270) {
        setB("W");
      } else if (parseInt((degree - 1) % 359) === 315) {
        setB("NW");
      } else {
        setB(parseInt((degree - 1) % 359));
      }

      if (parseInt(degree % 360) === 0) {
        setC("N");
      } else if (parseInt(degree % 360) === 45) {
        setC("NE");
      } else if (parseInt(degree % 360) === 90) {
        setC("E");
      } else if (parseInt(degree % 360) === 135) {
        setC("SE");
      } else if (parseInt(degree % 360) === 180) {
        setC("S");
      } else if (parseInt(degree % 360) === 225) {
        setC("SW");
      } else if (parseInt(degree % 360) === 270) {
        setC("W");
      } else if (parseInt(degree % 360) === 315) {
        setC("NW");
      } else {
        setC(parseInt(degree % 360));
      }

      if (parseInt((degree + 1) % 360) === 0) {
        setD("N");
      } else if (parseInt((degree + 1) % 360) === 45) {
        setD("NE");
      } else if (parseInt((degree + 1) % 360) === 90) {
        setD("E");
      } else if (parseInt((degree + 1) % 360) === 135) {
        setD("SE");
      } else if (parseInt((degree + 1) % 360) === 180) {
        setD("S");
      } else if (parseInt((degree + 1) % 360) === 225) {
        setD("SW");
      } else if (parseInt((degree + 1) % 360) === 270) {
        setD("W");
      } else if (parseInt((degree + 1) % 360) === 315) {
        setD("NW");
      } else {
        setD(parseInt((degree + 1) % 360));
      }

      if (parseInt((degree + 2) % 360) === 0) {
        setE("N");
      } else if (parseInt((degree + 2) % 360) === 45) {
        setE("NE");
      } else if (parseInt((degree + 2) % 360) === 90) {
        setE("E");
      } else if (parseInt((degree + 2) % 360) === 135) {
        setE("SE");
      } else if (parseInt((degree + 2) % 360) === 180) {
        setE("S");
      } else if (parseInt((degree + 2) % 360) === 225) {
        setE("SW");
      } else if (parseInt((degree + 2) % 360) === 270) {
        setE("W");
      } else if (parseInt((degree + 2) % 360) === 315) {
        setE("NW");
      } else {
        setE(parseInt((degree + 2) % 360));
      }
    }
  }, [degree]);

  useEffect(() => {
    setVarPitch(pitch * 5);

    setValue1(speed - 2);
    setValue2(speed - 1);
    setValue3(speed);
    setValue4(speed + 1);
    setValue5(speed + 2);
  
    setVal1(altitude - 2);
    setVal2(altitude - 1);
    setVal3(altitude);
    setVal4(altitude + 1);
    setVal5(altitude + 2);
  }, [speed, altitude, pitch]);

  useEffect(() => {
    // if (!mapRef.current) return;

    const leafletMap = L.map(mapRef.current).setView(
      [16.2726921, 80.4367664],
      15
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletMap);

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []);

  useEffect(() => {
    // Prevent adding marker again if it already exists
    if (vehicleRef.current || !map || !latitude || !longitude) return;
  
    // Add marker to the map
    vehicleRef.current = L.marker([latitude, longitude], {
      icon: planeIcon,
    }).addTo(map);
  }, [map, latitude, longitude]);


  useEffect(() => {
    if (initialRender && latitude === 0 && longitude === 0) {
      setInitialRender(false);
      return;
    }
  
    // Update map position when latitude or longitude changes
    if (map && latitude !== undefined && longitude !== undefined) {
      map.setView([latitude, longitude]);
  
      // if vehicle exists, then update its position
      if (vehicleRef.current) {
        vehicleRef.current.setLatLng([latitude, longitude]);
        vehicleRef.current.setRotationOrigin("center center");
        vehicleRef.current.setRotationAngle(vehicleHeading);
      }
    }
  }, [map, latitude, longitude, vehicleHeading, initialRender]);

  useEffect(() => {
    if (wayPoints.length === 0) return;
  
    if (map) {
      // Clear existing markers and polylines from the map
      if (markers.length > 0) {
        markers.forEach(marker => map.removeLayer(marker));
        setMarkers([]); // Clear markers state
      }
      if (polyLine) {
        map.removeLayer(polyLine);
      }
  
      const polyPoints = [];
      const newMarkers = [];
  
      wayPoints.forEach((dict) => {
        const { lat, lng } = dict;
        const marker = L.marker([lat, lng], { icon: locationIcon }).addTo(map);
        polyPoints.push([lat, lng]);
        newMarkers.push(marker);
      });
  
      // Add polyline to the map
      const newPolyLine = L.polyline(polyPoints, { color: "skyblue" }).addTo(map);
  
      // Update state with new markers and polyline
      setMarkers(newMarkers);
      setPolyLine(newPolyLine);
    }
  }, [wayPoints]);
  

  useEffect(() => {
    setDegree(parseInt(data?.Target?.input?.yaw));
    setSpeed(parseInt(data?.Target?.input?.verticalspeed));
    setAltitude(parseInt(data?.Target?.input?.alt));
    setMessage(String(data?.Target?.input?.message));
    setPitch(parseInt(data?.Target?.input?.pitch));
    setRoll(parseFloat(data?.Target?.input?.roll).toFixed(4));
    setAirSpeed(parseInt(data?.Target?.input?.airspeed));
    setGroundSpeed(parseInt(data?.Target?.input?.groundspeed));
    setMode(String(data?.Target?.input?.mode));
    setLatitude(data?.Target?.input?.lat);
    setLongitude(data?.Target?.input?.lng);
  }, [data]);

  return (
    <div className="hud-container">
      <div className="hud-part">
        <div className="hud-header">
          {/* HUD Top Left */}
          <div className="hud-top-left"></div>

          {/* HUD Heading */}
          <div className="hud-direction">
            <div className="direction-arrow">
              <i className="ri-triangle-fill"></i>
            </div>
            <div className="direction-values">
              <div className="direction-value">{a}</div>
              <div className="direction-value">{b}</div>
              <div className="direction-value">{c}</div>
              <div className="direction-value">{d}</div>
              <div className="direction-value">{e}</div>
            </div>
          </div>

          {/* HUD Top Right*/}
          <div className="hud-top-right"></div>
        </div>

        <div className="hud-body">
          {/* HUD Speedometer */}
          <div className="hud-speed">
            <div className="hud-speedometer">
              <div className="hud-each-speedometer">
                <div className="speed-line">
                  <i className="ri-subtract-fill"></i>
                </div>
                <div className="speed-value">{value5}</div>
              </div>
              <div className="hud-each-speedometer">
                <div className="speed-line">
                  <i className="ri-subtract-fill"></i>
                </div>
                <div className="speed-value">{value4}</div>
              </div>
              <div className="hud-each-speedometer">
                <div className="speed-line">
                  <i className="ri-home-fill" id="speed-home-fill"></i>
                </div>
                <div className="speed-value">{value3}</div>
              </div>
              <div className="hud-each-speedometer">
                <div className="speed-line">
                  <i className="ri-subtract-fill"></i>
                </div>
                <div className="speed-value">{value2}</div>
              </div>
              <div className="hud-each-speedometer">
                <div className="speed-line">
                  <i className="ri-subtract-fill"></i>
                </div>
                <div className="speed-value">{value1}</div>
              </div>
            </div>
          </div>

          {/* HUD Display */}
          <div className="hud-display">
            <div className="all-lines">
              <img
                src={medianLine}
                id="median-line"
                alt=""
                className="median-pitch-line"
                style={{ transform: `rotate(${-roll}deg)` }}
              />
              <img
                src={pitchLines}
                alt=""
                className="pitch-lines"
                id="pitch-lines"
                style={{ transform: `rotate(${-roll}deg)` }}
              />
              <div className="roll-lines">
                <i class="ri-triangle-line"></i>
                <img
                  src={compass}
                  alt=""
                  className="compass-lines"
                  id="compass"
                  style={{ transform: `rotate(${-roll}deg)` }}
                />
              </div>
              <div
                className="hud-sky"
                id="sky"
                style={{
                  transform: `rotate(${-roll}deg)`,
                  transformOrigin: "bottom center",
                  bottom: `calc(50% - ${varPitch}px)`,
                  // transition: "0.1s",
                  // 263px
                }}
              ></div>
            </div>
          </div>

          {/* HUD Altimeter */}
          <div className="hud-altitude">
            <div className="hud-altimeter">
              <div className="hud-each-altimeter">
                <div className="alt-value">{val5}</div>
                <div className="alt-line">
                  <i className="ri-subtract-fill"></i>
                </div>
              </div>
              <div className="hud-each-altimeter">
                <div className="alt-value">{val4}</div>
                <div className="alt-line">
                  <i className="ri-subtract-fill"></i>
                </div>
              </div>
              <div className="hud-each-altimeter">
                <div className="alt-value">{val3}</div>
                <div className="alt-line">
                  <i className="ri-home-fill" id="alt-home-fill"></i>
                </div>
              </div>
              <div className="hud-each-altimeter">
                <div className="alt-value">{val2}</div>
                <div className="alt-line">
                  <i className="ri-subtract-fill"></i>
                </div>
              </div>
              <div className="hud-each-altimeter">
                <div className="alt-value">{val1}</div>
                <div className="alt-line">
                  <i className="ri-subtract-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hud-footer">
          {/* HUD Footer Left */}
          <div className="hud-foot-left">
            <div className="hud-quicks">
              <div className="quicks-row1">
                <div className="qi">
                  <div className="qi-key" id="item1-key">
                    pitch
                  </div>
                  <div className="qi-value" id="item1-Val">
                    {pitch}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item2-Key">
                    roll
                  </div>
                  <div className="qi-value" id="item2-Val">
                    {parseInt(roll)}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item3-Key">
                    yaw
                  </div>
                  <div className="qi-value" id="item3-Val">
                    {degree}
                  </div>
                </div>
              </div>
              <div className="quicks-row2">
                <div className="qi">
                  <div className="qi-key" id="item4-Key">
                    airSpeed
                  </div>
                  <div className="qi-value" id="item4-Val">
                    {airSpeed}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item5-Key">
                    groundSpeed
                  </div>
                  <div className="qi-value" id="item5-Val">
                    {groundSpeed}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item6-Key">
                    mode
                  </div>
                  <div className="qi-value" id="item6-Val">
                    {mode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HUD Messages */}
          <div className="hud-messages">
            <div className="hud-msg">{message}</div>
          </div>
        </div>
      </div>

      <div className="map-part">
        <div className="map" ref={mapRef}></div>
      </div>
    </div>
  );
};

export default Hud;
