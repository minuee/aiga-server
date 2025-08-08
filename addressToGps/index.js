import { address_aiga } from "./address.js";
import { address_aiga2025 } from "./address.js";
import axios from "axios";
import dotenv from "dotenv";

import { connection, close, select, insert, update } from "./database.js";

dotenv.config({
  override: true,
});

async function get_address_info(addresses) {
  const result = [];
  for (const address of addresses) {
    const [name, addr] = address.split("\t");
    const response = await axios.get(`http://dapi.kakao.com/v2/local/search/address.json?query=${addr}`, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
    });
    if(response.data.documents.length === 0) {
      console.log(`${name} ${addr} 주소 정보를 찾을 수 없습니다.`);
      continue;
    }

    const x = response.data.documents[0].x;
    const y = response.data.documents[0].y;

    // result.push({name, addr, lat:x, lon:y});
    // 이상하다. x:경도, y:위도
    result.push({name, addr, lat:y, lon:x});
  }
  return result;
}

async function main() {
  
  await connection();

  // const data = address_aiga.split("\n").splice(0, 1);
  const data = address_aiga.split("\n");
  const source = await get_address_info(data);

  const target = address_aiga2025.split("\n");
  for (let i = 0; i < target.length; i++) {
    const hid = target[i].split("\t")[0];
    const baseName = target[i].split("\t")[1];
    const shortName = target[i].split("\t")[2];
    const found = source.find(s => {
      if (s.name === baseName || s.name === shortName) {
        return true;
      }
    });
    if(found) {
      const address = {
        hid,
        baseName,
        shortName,
        addr: found.addr,
        lat: found.lat,
        lon: found.lon,
      };
      const result = await select("update hospital set address=?, lat=?, lon=? where hid = ?", [address.addr, address.lat, address.lon, address.hid]);
    }
  } 
  await close();
} 

main();