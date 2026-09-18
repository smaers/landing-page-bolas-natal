const PhotoStore = (()=>{
  const DB_NAME='esferas-encantadas'; const STORE='photos'; const KEY='orderPhotos';
  function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function save(files){const d=await db(); return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite'); const st=tx.objectStore(STORE); st.put(files,KEY); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error);})}
  async function load(){const d=await db(); return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readonly'); const r=tx.objectStore(STORE).get(KEY); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error)})}
  async function clear(){const d=await db(); return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(KEY); tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error)})}
  return {save,load,clear};
})();