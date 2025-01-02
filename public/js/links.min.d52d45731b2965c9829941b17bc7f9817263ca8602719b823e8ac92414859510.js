document.addEventListener("DOMContentLoaded",function(){const e="https://script.google.com/macros/s/AKfycbzjyQRiPiz2ejXyBD-68th_q-Mqe-oVQ4925VHfKsCCv7ROimh3fmNVbPujCF0F9nn0/exec?key=x5DA7Gxf8FnCFnDe";fetch(e).then(e=>{if(!e.ok)throw new Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{const t=document.getElementById("linkroll");t.innerHTML="";const n=e.slice(-9);n.forEach(e=>{const n=document.createElement("div");n.innerHTML=`
          <li class="pinboard_link">
            <a href="${e.url}">${e.title}</a>
            <span class="pinboard_desc">${e.description}</span>
          </li>
        `,t.appendChild(n)})}).catch(e=>{console.error("Error fetching data:",e),document.getElementById("linkroll").innerHTML="<p>Error loading links.</p>"})})