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
import locIcon from "../images/loc.png";
import planeLoc from "../images/copter.png";

const Hud = () => {
  const [data, setData] = useState({});

  let retryCount1 = 0;
  let retryCount2 = 0;

  // fetching data
  useEffect(() => {
    let timeoutId;

    const fetchData = async () => {
      if (retryCount1 >= 100) {
        console.log("Maximum retries reached. Stopping further requests.");
        return;
      }
      try {
        const response = await axios.get(
          "https://missionplanner-api.onrender.com/tdata-data"
        );
        // console.log(response.data);
        setData(response.data);
        timeoutId = setTimeout(fetchData, 5);
      } catch (error) {
        console.log("Error from Data.");
        retryCount1++;
        timeoutId = setTimeout(fetchData, 5);
      }
    };

    fetchData();

    return () => clearTimeout(timeoutId);
  }, []);

  // fetching waypoints
  useEffect(() => {
    let timerId;

    const fetchWayPoints = async () => {
      if (retryCount2 >= 100) {
        console.log("Maximum retries reached. Stopping further requests.");
        return;
      }
      try {
        const points = await axios.get(
          "https://missionplanner-api.onrender.com/waypoints-data"
        );
        setWayPoints(points.data);
        timerId = setTimeout(fetchWayPoints, 5);
      } catch (error) {
        console.log("Error from WayPoints");
        retryCount2++;
        timerId = setTimeout(fetchWayPoints, 5);
      }
    };

    fetchWayPoints();

    // Cleanup function to clear the timeout when the component unmounts
    return () => clearTimeout(timerId);
  }, []); // Empty dependency array to run effect only once on component mount

  // declaring things
  const [vehicleHeading, setVehicleHeading] = useState(0);
  const [degree, setDegree] = useState(0);
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [c, setC] = useState(null);
  const [d, setD] = useState(null);
  const [e, setE] = useState(null);
  const [speed, setSpeed] = useState(0);
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
  const [pitch, setPitch] = useState(0);
  const [varPitch, setVarPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [airSpeed, setAirSpeed] = useState(0);
  const [groundSpeed, setGroundSpeed] = useState(0);
  const [mode, setMode] = useState(null);
  const [armStatus, setArmStatus] = useState(false);
  const [gpsStatus, setGPSStatus] = useState(0);
  const [batteryCurrent, setBatteryCurrent] = useState(0);
  const [batteryVoltage, setBatteryVoltage] = useState(0);
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [distToCurrWayPoint, setDistToCurrWayPoint] = useState(0);
  const [wayPointNumber, setWayPointNumber] = useState(0);
  const [distTravelled, setDistTravelled] = useState(0);
  const [linkqualitygcs, setLinkQualitygcs] = useState(0);
  const [connectedStatus, setConnectedStatus] = useState(false);
  const [gpsTime, setGPSTime] = useState(new Date());
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const mapRef = useRef(null);
  const vehicleRef = useRef(null);
  const [map, setMap] = useState(null);
  const [initialRender, setInitialRender] = useState(true);
  const [polyLine, setPolyLine] = useState(null);
  const [wayPoints, setWayPoints] = useState([]);
  const [markers, setMarkers] = useState([]);

  // customizing location icon
  var locationIcon = L.icon({
    iconUrl: locIcon,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // point from which the popup should open relative to the iconAnchor
  });

  // customizing vehicle icon
  var planeIcon = L.icon({
    iconUrl: planeLoc,
    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // point from which the popup should open relative to the iconAnchor
    rotationAngle: 0,
    rotationOrigin: "50% 50%",
  });

  // declaring dictionary for showing degree
  const degrees = {};
  for (let i = 0; i < 361; i++) {
    degrees[i] = i;
  }
  degrees[0] = "N";
  degrees[45] = "NE";
  degrees[90] = "E";
  degrees[135] = "SE";
  degrees[180] = "S";
  degrees[225] = "SW";
  degrees[270] = "W";
  degrees[315] = "NW";

  // declaring gps status
  const gps = {
    0: "No GPS",
    1: "No Fixed",
    2: "2D Fixed",
    3: "3D Fixed",
    4: "3DGPS",
    5: "RTK Float",
    6: "RTK Fixed",
  };

  // updating state
  useEffect(() => {
    setVehicleHeading(degree);
    setA(degrees[(degree - 2 + 360) % 360]);
    setB(degrees[(degree - 1 + 360) % 360]);
    setC(degrees[degree % 360]);
    setD(degrees[(degree + 1) % 360]);
    setE(degrees[(degree + 2) % 360]);
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
  }, [speed, altitude, pitch, degree]);

  // initializing map once!!
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

  // adding vehicle marker to the map once
  useEffect(() => {
    // Prevent adding marker again if it already exists
    if (vehicleRef.current || !map || !latitude || !longitude) return;

    // Add marker to the map
    vehicleRef.current = L.marker([latitude, longitude], {
      icon: planeIcon,
    }).addTo(map);
  }, [map, latitude, longitude]);

  // updating vehicle position and dealing initial position
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

  // creating path and adding markers on path
  useEffect(() => {
    if (wayPoints.length === 0) {
      if (map) {
        // Clear existing markers and polylines from the map
        if (markers.length > 0) {
          markers.forEach((marker) => map.removeLayer(marker));
          setMarkers([]); // Clear markers state
        }
        if (polyLine) {
          map.removeLayer(polyLine);
        }
      }
      return;
    }

    if (map) {
      // Clear existing markers and polylines from the map
      if (markers.length > 0) {
        markers.forEach((marker) => map.removeLayer(marker));
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
      const newPolyLine = L.polyline(polyPoints, { color: "blue" }).addTo(map);

      // Update state with new markers and polyline
      setMarkers(newMarkers);
      setPolyLine(newPolyLine);
    }
  }, [wayPoints]);

  // Changing state
  useEffect(() => {
    if (isNaN(parseInt(data?.Target?.input?.yaw))) {
      setDegree(0);
    } else {
      setDegree(parseInt(data?.Target?.input?.yaw));
    }
    if (isNaN(parseInt(data?.Target?.input?.verticalspeed))) {
      setSpeed(0);
    } else {
      setSpeed(parseInt(data?.Target?.input?.verticalspeed));
    }
    if (isNaN(parseInt(data?.Target?.input?.alt))) {
      setAltitude(0);
    } else {
      setAltitude(parseInt(data?.Target?.input?.alt));
    }
    setMessage(String(data?.Target?.input?.message));
    if (isNaN(parseInt(data?.Target?.input?.pitch))) {
      setPitch(0);
    } else {
      setPitch(parseInt(data?.Target?.input?.pitch));
    }
    if (isNaN(parseInt(data?.Target?.input?.roll))) {
      setRoll(0);
    } else {
      setRoll(parseFloat(data?.Target?.input?.roll));
    }
    // setRoll(parseFloat(data?.Target?.input?.roll).toFixed(4));
    if (isNaN(parseInt(data?.Target?.input?.airspeed))) {
      setAirSpeed(0.0);
    } else {
      setAirSpeed(parseFloat(data?.Target?.input?.airspeed).toFixed(1));
    }
    if (isNaN(parseInt(data?.Target?.input?.groundspeed))) {
      setGroundSpeed(0.0);
    } else {
      setGroundSpeed(parseFloat(data?.Target?.input?.groundspeed).toFixed(1));
    }
    setMode(String(data?.Target?.input?.mode));
    setLatitude(data?.Target?.input?.lat);
    setLongitude(data?.Target?.input?.lng);
    setArmStatus(data?.Target?.input?.armed);
    setConnectedStatus(data?.Target?.input?.connected);
    if (isNaN(parseInt(data?.Target?.input?.gpsstatus))) {
      setGPSStatus(0);
    } else {
      setGPSStatus(parseInt(data?.Target?.input?.gpsstatus));
    }
    if (isNaN(parseInt(data?.Target?.input?.battery_voltage))) {
      setBatteryVoltage(0);
    } else {
      setBatteryVoltage(
        parseFloat(data?.Target?.input?.battery_voltage).toFixed(2)
      );
    }
    if (isNaN(parseInt(data?.Target?.input?.battery_remaining))) {
      setBatteryPercentage(0);
    } else {
      setBatteryPercentage(parseInt(data?.Target?.input?.battery_remaining));
    }
    if (isNaN(parseInt(data?.Target?.input?.current))) {
      setBatteryCurrent(0);
    } else {
      setBatteryCurrent(parseFloat(data?.Target?.input?.current).toFixed(1));
    }
    if (isNaN(data?.Target?.input?.wp_dist)) {
      setDistToCurrWayPoint(0);
    } else {
      setDistToCurrWayPoint(parseInt(data?.Target?.input?.wp_dist));
    }
    if (isNaN(data?.Target?.input?.wpno)) {
      setWayPointNumber(0);
    } else {
      setWayPointNumber(parseInt(data?.Target?.input?.wpno));
    }
    if (isNaN(data?.Target?.input?.distTraveled)) {
      setDistTravelled(0);
    } else {
      setDistTravelled(parseInt(data?.Target?.input?.distTraveled));
    }
    if (isNaN(data?.Target?.input?.linkqualitygcs)) {
      setLinkQualitygcs(0);
    } else {
      setLinkQualitygcs(parseInt(data?.Target?.input?.linkqualitygcs));
    }
    setGPSTime(new Date());
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
          <div className="hud-top-right">
            <div className={connectedStatus ? "connected" : "disconnected"}>
              <i class="ri-link-m"></i>
              <div className="c-stats">
                {connectedStatus ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
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
                // style={{ transform: `rotate(${-roll}deg)` }}
              />
              <img
                src={pitchLines}
                alt=""
                className="pitch-lines"
                id="pitch-lines"
                style={{ transform: `rotate(${-roll}deg)` }}
              />
              <div
                className={
                  armStatus ? "arm-message armed" : "arm-message disarmed"
                }
              >
                {armStatus ? "ARMED" : "DISARMED"}
              </div>
              <div className="hud-params-top">
                <div className="hud-top-param1">
                  {linkqualitygcs}%
                  <br />
                  {gpsTime.toLocaleTimeString()}
                </div>
                <div className="hud-top-param2">{mode}</div>
              </div>
              <div className="hud-params-bottom">
                <div className="hud-bottom-param1">
                  A/S {airSpeed}m/s
                  <br></br>
                  G/S {groundSpeed}m/s
                  <br></br>
                  Bat {batteryVoltage}v {batteryCurrent}A {batteryPercentage}%
                </div>
                <div className="hud-bottom-param2">
                  {distToCurrWayPoint}m{">"}
                  {wayPointNumber}
                  <br></br>
                  GPS : {gps[gpsStatus]}
                </div>
              </div>
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
                    verticalSpeed
                  </div>
                  <div className="qi-value" id="item4-Val">
                    {speed}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item5-Key">
                    altitude
                  </div>
                  <div className="qi-value" id="item5-Val">
                    {altitude}
                  </div>
                </div>
                <div className="qi">
                  <div className="qi-key" id="item6-Key">
                    dist Travelled
                  </div>
                  <div className="qi-value" id="item6-Val">
                    {distTravelled}
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
