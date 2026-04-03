import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { 
    getFirestore, collection, onSnapshot, deleteDoc, doc, updateDoc 
  } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBN9CPViV4ok9kAhZTBGm8h76x8XcAdmGk",
    authDomain: "my-listing-947ff.firebaseapp.com",
    projectId: "my-listing-947ff",
    storageBucket: "my-listing-947ff.appspot.com",
    messagingSenderId: "1039885458733",
    appId: "1:1039885458733:web:0e3a06b5dd600e3b2f07a4",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const studentsCol = collection(db, "students");

  const tbody = document.getElementById("displayTableBody");
  const recordCount = document.getElementById("recordCount");
  const searchInput = document.getElementById("searchInput");
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));

  let allDocs = [];

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  }

  const formatMoney = (num) => {
    return Number(num) < 1000 ? `$${num}` : `${Number(num).toLocaleString("km-KH")} ៛`;
  };

  // បង្ហាញតារាង
  function renderTable(docs) {
    if (docs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-white-50">រកមិនឃើញទិន្នន័យឡើយ</td></tr>`;
      return;
    }
    
    tbody.innerHTML = docs.map((d, index) => {
      const item = d.data();
      const id = d.id;
      return `
        <tr>
          <td class="text-center fw-bold" style="color:var(--primary-digital)">${index + 1}</td>
          <td class="fw-bold">${escapeHtml(item.full_name)}</td>
          <td><i class="fas fa-map-marker-alt me-2 opacity-50"></i>${escapeHtml(item.address)}</td>
          <td class="text-end fw-bold" style="color:#00ffaa;">${formatMoney(item.money)}</td>
          <td class="text-center">
            <button class="btn-action btn-edit" onclick="prepareEdit('${id}', '${escapeHtml(item.full_name)}', '${escapeHtml(item.address)}', ${item.money})">
              <i class="fas fa-pen-nib"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteRecord('${id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ទាញទិន្នន័យ Real-time
  onSnapshot(studentsCol, (snapshot) => {
    allDocs = snapshot.docs;
    recordCount.innerText = allDocs.length;
    renderTable(allDocs);
  });

  // មុខងារលុប
  window.deleteRecord = async (id) => {
    if(confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (err) { alert("លុបមិនបានសម្រេច!"); }
    }
  };

  // រៀបចំការ Edit
  window.prepareEdit = (id, name, addr, money) => {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editAddress').value = addr;
    document.getElementById('editMoney').value = money;
    editModal.show();
  };

  // រក្សាទុកការ Edit
  document.getElementById('saveUpdateBtn').addEventListener('click', async () => {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value.trim();
    const addr = document.getElementById('editAddress').value.trim();
    const money = Number(document.getElementById('editMoney').value);

    if(!name || !addr) return alert("សូមបំពេញព័ត៌មានឱ្យគ្រប់");

    try {
      await updateDoc(doc(db, "students", id), {
        full_name: name,
        address: addr,
        money: money
      });
      editModal.hide();
    } catch (err) { alert("ការកែប្រែបរាជ័យ!"); }
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allDocs.filter(d => {
      const item = d.data();
      return item.full_name.toLowerCase().includes(term) || item.address.toLowerCase().includes(term);
    });
    renderTable(filtered);
  });