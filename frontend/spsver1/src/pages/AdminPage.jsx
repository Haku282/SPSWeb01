import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // Thêm import này
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import './AdminPage.css';
import { logErrorToBackend } from '../utils/errorTracking';
import { 
  exportPurchaseHistoryToExcel, 
  exportImportBatchesToExcel, 
  exportExportTicketsToExcel,
  exportComprehensiveReportToExcel 
} from '../utils/excelExport';

const AdminPage = () => {
  const location = useLocation(); // Khởi tạo useLocation để lấy đường dẫn hiện tại

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Thêm state để lưu user hiện tại
  const [products, setProducts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [unitsList, setUnitsList] = useState([]);
  const [unitsMap, setUnitsMap] = useState({});
  const [suppliersList, setSuppliersList] = useState([]); 
  
  const [importBatches, setImportBatches] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);
  
  const [batchFormData, setBatchFormData] = useState({
    batch_number: '',
    supplier_id: '',
    total_price: 0,
    products: [] 
  });

  // ==========================================
  // --- STATE MỚI: MODAL THÊM SẢN PHẨM LÔ HÀNG ---
  // ==========================================
  const [showBatchProductModal, setShowBatchProductModal] = useState(false);
  const [batchProductFormData, setBatchProductFormData] = useState({
    product_code: '',
    product_name: '',
    category_id: '',
    unit_id: '',
    import_price: '',
    quantity: '',
    selling_price: '',
    manufacture_date: '',
    expiry_date: '',
    active_ingredient: '',
    storage_condition: '',
    description: ''
  });

  // ==========================================
  // --- STATE MỚI: QUẢN LÝ XUẤT KHO ---
  // ==========================================
  const [exportTickets, setExportTickets] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableQtyByProductId, setAvailableQtyByProductId] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportDetailModal, setShowExportDetailModal] = useState(false);
  const [selectedExportTicket, setSelectedExportTicket] = useState(null);
  const [exportTicketDetails, setExportTicketDetails] = useState([]);
  
  // State để quản lý lô hàng được chọn & sản phẩm trong lô
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [productsInBatch, setProductsInBatch] = useState([]);
  
  const [exportFormData, setExportFormData] = useState({
    batch_id: null,
    customer: '',
    note: '',
    products: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mặc định tab sẽ dựa theo URL ở useEffect bên dưới
  const [activeTab, setActiveTab] = useState('products');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  // Trigger để force update inventory sau khi save
  const [inventoryRefreshTrigger, setInventoryRefreshTrigger] = useState(0);

  // --- THÊM MỚI: Lấy user hiện tại từ localStorage ---
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('sps_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("User từ localStorage:", user); // Debug log
        setCurrentUser(user);
      } else {
        console.warn("Không tìm thấy sps_user trong localStorage"); // Debug log
      }
    } catch (e) {
      console.error("Lỗi khi lấy user từ localStorage:", e);
    }
  }, []);

  // --- THÊM MỚI: Tự động đổi tab khi bấm từ Sidebar ---
  useEffect(() => {
    if (location.pathname === '/qlnhapkho') {
      setActiveTab('import');
    } else if (location.pathname === '/qlxuatkho') {
      setActiveTab('export');
    } else if (location.pathname === '/qlhh') {
      // Khi vào trang hàng hóa, hiển thị tab danh mục hàng hóa (hoặc giữ lại history nếu đang mở)
      if (activeTab === 'import' || activeTab === 'export') {
         setActiveTab('products');
      }
    }
  }, [location.pathname]);
  // ----------------------------------------------------

  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    product_code: '', product_name: '', category_id: '', unit_id: '',
    selling_price: '', image: '', description: '', active_ingredient: '', 
    storage_condition: ''
  });

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : 'http://localhost:5000';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let currentMap = {};

      try {
        const catRes = await fetch(`${API_BASE}/api/product_category`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } });
        if (catRes.ok) {
          const catJson = await catRes.json();
          const catList = Array.isArray(catJson) ? catJson : catJson.data || [];
          catList.forEach((c) => {
            const id = c.category_id ?? c.id;
            const name = c.category_name ?? c.name ?? '';
            if (id != null) currentMap[id] = { name, description: c.description ?? '' };
          });
          setCategoriesMap(currentMap);
        }
      } catch (err) { 
        console.error("Lỗi API Danh mục:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy danh mục sản phẩm: ${err.message}`);
      }

      let currentUnitMap = {};
      try {
        const unitRes = await fetch(`${API_BASE}/api/unit`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } });
        if (unitRes.ok) {
          const unitJson = await unitRes.json();
          const unitList = Array.isArray(unitJson) ? unitJson : unitJson.data || [];
          unitList.forEach((u) => { currentUnitMap[u.unit_id] = u.unit_name; });
          setUnitsMap(currentUnitMap);
          setUnitsList(unitList);
        }
      } catch (err) { 
        console.error("Lỗi API Đơn vị tính:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy đơn vị tính: ${err.message}`);
      }

      try {
        const supRes = await fetch(`${API_BASE}/api/supplier`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } });
        if (supRes.ok) {
          const supJson = await supRes.json();
          setSuppliersList(Array.isArray(supJson) ? supJson : supJson.data || []);
        }
      } catch (err) { 
        console.error("Lỗi API Nhà cung cấp:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy nhà cung cấp: ${err.message}`);
      }

      try {
        const prodRes = await fetch(`${API_BASE}/api/product`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } });
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          const prodList = Array.isArray(prodJson) ? prodJson : prodJson.data || [];
          const normalized = prodList.map((p) => ({
            ...p,
            product_id: p.product_id ?? p.id ?? null,
            category_name: p.category_name || '',
            unit_name: p.unit_name || '',
            // getAllProduct hiện không trả product_code, nên để trống để UI hiển thị placeholder
            product_code: p.product_code ?? '',
            // Chuẩn hoá image thành URL dùng được (nếu backend trả filename)
            image: p.image
              ? (String(p.image).startsWith('http') ? p.image : `${API_BASE}/uploads/${p.image}`)
              : null
          }));
          setProducts(normalized);
        }
      } catch (err) { 
        console.error("Lỗi kết nối:", err.message);
        logErrorToBackend('AdminPage', `Lỗi tải sản phẩm: ${err.message}`);
      }

      try {
        const batchRes = await fetch(`${API_BASE}/api/import_batch`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } });
        if (batchRes.ok) {
          const batchJson = await batchRes.json();
          setImportBatches(Array.isArray(batchJson) ? batchJson : batchJson.data || []);
        }
      } catch (err) { 
        console.error("Lỗi API Phiếu Nhập:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy phiếu nhập kho: ${err.message}`);
      }

      // 3. FETCH XUẤT KHO: Lấy danh sách phiếu đã xuất
      try {
        const resExport = await fetch(`${API_BASE}/api/export_batch`, { credentials: 'include' });
        if (resExport.ok) {
          const json = await resExport.json();
          setExportTickets(json.data || []);
        }
      } catch (err) { 
        console.error("Lỗi API Phiếu Xuất:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy phiếu xuất kho: ${err.message}`);
      }

      // 4. FETCH XUẤT KHO: Lấy SP sẵn có trong kho để chọn khi tạo phiếu mới
      try {
        const resAvail = await fetch(`${API_BASE}/api/export_batch/available`, { credentials: 'include' });
        if (resAvail.ok) {
          const json = await resAvail.json();
          const list = (json.data && Array.isArray(json.data)) ? json.data : (Array.isArray(json) ? json : []);
          
          // Validate dữ liệu từ backend
          if (list.length > 0) {
            console.log("✅ Lấy được danh sách sản phẩm xuất kho:", list);
          } else {
            console.warn("⚠️ Danh sách sản phẩm xuất kho trống");
          }
          
          setAvailableProducts(list);

          // Build map product_id -> available qty (fallback nhiều key name)
          const qtyMap = {};
          list.forEach((item) => {
            const pid = item.product_id ?? item.id;
            if (pid == null) return;
            const qty = Number(item.total_available ?? item.available_qty ?? item.qty ?? item.quantity ?? 0);
            qtyMap[pid] = qty;
          });
          setAvailableQtyByProductId(qtyMap);
        } else {
          console.error("❌ Lỗi API Sản phẩm Xuất:", resAvail.status, resAvail.statusText);
          logErrorToBackend('AdminPage', `Lỗi tải sản phẩm xuất kho: HTTP ${resAvail.status}`);
        }
      } catch (err) { 
        console.error("❌ Lỗi kết nối API Sản phẩm Xuất:", err.message);
        logErrorToBackend('AdminPage', `Lỗi tải sản phẩm xuất kho: ${err.message}`);
      }

      // 5. FETCH LỊCH SỬ MUA HÀNG (TOÀN BỘ CHO ADMIN)
      try {
        const resHistory = await fetch(`${API_BASE}/api/user_history/staff`, { credentials: 'include' });
        if (resHistory.ok) {
          const json = await resHistory.json();
          setPurchaseHistory(Array.isArray(json) ? json : json.data || []);
        }
      } catch (err) { 
        console.error("Lỗi API Lịch sử mua hàng:", err.message);
        logErrorToBackend('AdminPage', `Lỗi lấy lịch sử mua hàng: ${err.message}`);
      }

    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchAll();
    setIsInitialLoadDone(true);
  }, [fetchAll]);

  // ==========================================
  // --- THÊM MỚI: Fetch Inventory từ product_batch_detail để cập nhật Product Code và Quantity ---
  // ==========================================
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Gọi API lấy tất cả import batches
        const resBatches = await fetch(`${API_BASE}/api/import_batch`, { credentials: 'include' });
        if (!resBatches.ok) {
          console.error("Lỗi khi fetch import_batch:", resBatches.status);
          return;
        }
        
        const batchesData = await resBatches.json();
        const batches = Array.isArray(batchesData) ? batchesData : batchesData.data || [];

        if (batches.length === 0) {
          console.log("Không có batch nào");
          return;
        }

        // Build map product_id -> { product_code, total_quantity, category_id, unit_id, category_name, unit_name }
        const inventoryMap = {};

        // Duyệt qua từng batch để lấy chi tiết (với delay để tránh overload server)
        for (const batch of batches) {
          try {
            const resBatchDetails = await fetch(`${API_BASE}/api/import_batch/${batch.batch_id}`, { credentials: 'include' });
            if (!resBatchDetails.ok) {
              console.error(`Lỗi khi fetch batch detail ${batch.batch_id}:`, resBatchDetails.status);
              continue; // Skip batch này và tiếp tục batch tiếp theo
            }

            const detailsData = await resBatchDetails.json();
            const details = Array.isArray(detailsData) ? detailsData : detailsData.data || [];

            // Duyệt qua chi tiết để xây dựng inventory map
            details.forEach((detail) => {
              const pid = detail.product_id;
              if (pid == null) return;

              if (!inventoryMap[pid]) {
                inventoryMap[pid] = {
                  product_code: detail.product_code || '',
                  quantity: 0,
                  category_id: detail.category_id || null,
                  unit_id: detail.unit_id || null,
                  category_name: detail.category_name || '',
                  unit_name: detail.unit_name || ''
                };
              }

              // Cộng dồn số lượng từ tất cả các lô
              inventoryMap[pid].quantity += Number(detail.quantity ?? 0);
              // Cập nhật product_code nếu chưa có
              if (!inventoryMap[pid].product_code && detail.product_code) {
                inventoryMap[pid].product_code = detail.product_code;
              }
              // Cập nhật category_name nếu chưa có
              if (!inventoryMap[pid].category_name && detail.category_name) {
                inventoryMap[pid].category_name = detail.category_name;
                inventoryMap[pid].category_id = detail.category_id;
              }
              // Cập nhật unit_name nếu chưa có
              if (!inventoryMap[pid].unit_name && detail.unit_name) {
                inventoryMap[pid].unit_name = detail.unit_name;
                inventoryMap[pid].unit_id = detail.unit_id;
              }
            });

            // Thêm delay 100ms giữa các request để tránh overload
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Lỗi khi fetch batch detail ${batch.batch_id}:`, err.message);
            logErrorToBackend('AdminPage', `Lỗi lấy chi tiết lô hàng ${batch.batch_id}: ${err.message}`);
            continue; // Skip batch này và tiếp tục batch tiếp theo
          }
        }

        console.log("Inventory Map:", inventoryMap);
        console.log("Current products count:", products.length);

        // Update products với thông tin từ inventory - chỉ update nếu có dữ liệu
        if (products.length > 0) {
          setProducts((prevProducts) => {
            console.log("Updating products. Before:", prevProducts.length);
            
            const updatedProducts = prevProducts.map((p) => ({
              ...p,
              product_code: inventoryMap[p.product_id]?.product_code || p.product_code || '',
              category_id: inventoryMap[p.product_id]?.category_id || p.category_id,
              category_name: inventoryMap[p.product_id]?.category_name || p.category_name || 'N/A',
              unit_id: inventoryMap[p.product_id]?.unit_id || p.unit_id,
              unit_name: inventoryMap[p.product_id]?.unit_name || p.unit_name || 'N/A',
              total_available: inventoryMap[p.product_id]?.quantity ?? (availableQtyByProductId[p.product_id] ?? 0)
            }));
            
            console.log("After:", updatedProducts.length);
            return updatedProducts;
          });
        }
      } catch (err) {
        console.error("Lỗi khi fetch inventory:", err.message);
        logErrorToBackend('AdminPage', `Lỗi tải kho hàng: ${err.message}`);
      }
    };

    // Chỉ fetch inventory nếu đã có products và initial load đã xong
    if (products.length > 0 && importBatches.length > 0 && isInitialLoadDone) {
      console.log("Starting fetchInventory with", products.length, "products and", importBatches.length, "batches");
      const timeout = setTimeout(() => {
        fetchInventory();
      }, 500); // Delay 500ms để đảm bảo products đã render xong
      
      return () => clearTimeout(timeout);
    }
  }, [API_BASE, products.length, importBatches.length, isInitialLoadDone, inventoryRefreshTrigger]);

  useEffect(() => {
    const total = batchFormData.products.reduce((sum, item) => {
      // Ưu tiên import_price, nếu không có thì dùng selling_price
      const price = Number(item.import_price) || Number(item.selling_price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
    setBatchFormData(prev => ({ ...prev, total_price: total }));
  }, [batchFormData.products]);

  const createExplosion = (el, color = '#ff5c5c', count = 12) => {
    if (!el) return;
    el.style.position = el.style.position || 'relative';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'btn-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const distance = 60 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = Math.floor(Math.random() * 360);
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.setProperty('--rot', `${rot}deg`);
      p.style.background = color;
      el.appendChild(p);
      p.addEventListener('animationend', () => p.remove(), { once: true });
    }
  };

  const handleDeleteClick = async (productId, e) => {
    const btn = e.currentTarget;
    try {
      const response = await fetch(`${API_BASE}/api/product/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        createExplosion(btn, '#ff6b6b', 14);
        btn.classList.add('btn-exploding');
        setTimeout(() => {
          setProducts((prev) => prev.filter((p) => p.product_id !== productId));
          btn.classList.remove('btn-exploding');
        }, 520);
      } else {
        const result = await response.json();
        alert(result.message || "Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const handleEdit = (product) => {
    setImagePreview(null);
    setEditingId(product.product_id);
    setFormData({
      product_code: product.product_code || '',
      product_name: product.product_name || '',
      // Select option values là string, nên ép string để hiển thị đúng
      category_id: (product.category_id != null && product.category_id !== '') ? String(product.category_id) : '',
      unit_id: (product.unit_id != null && product.unit_id !== '') ? String(product.unit_id) : '',
      selling_price: product.selling_price || '',
      image: product.image || '',
      description: product.description || '',
      active_ingredient: product.active_ingredient || '',
      storage_condition: product.storage_condition || ''
    });
    // Convert image path to full URL để hiển thị trong preview
    if (product.image) {
      const imageUrl = String(product.image).startsWith('http') 
        ? product.image 
        : `${API_BASE}/uploads/${product.image}`;
      setImagePreview(imageUrl);
    }
    setShowModal(true);
  };

  const handleAddNew = () => {
    setImagePreview(null);
    setEditingId(null);
    setFormData({
      product_code: '', product_name: '', category_id: '', unit_id: '',
      selling_price: '', image: '', description: '', active_ingredient: '', 
      storage_condition: ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product_code.trim()) return alert('Vui lòng nhập Mã SP');
    if (!formData.product_name.trim()) return alert('Vui lòng nhập Tên SP');
    if (!formData.category_id) return alert('Vui lòng chọn Danh mục');
    if (!formData.unit_id) return alert('Vui lòng chọn Đơn vị');
    if (!formData.selling_price) return alert('Vui lòng nhập Giá bán');
    
    console.log("Form data gửi lên:", formData);

    const url = editingId ? `${API_BASE}/api/product/${editingId}` : `${API_BASE}/api/product`;
    const method = editingId ? 'PUT' : 'POST';

    const hasNewImageFile = formData.image instanceof File;

    try {
      let response;
      if (hasNewImageFile) {
        // Chỉ dùng multipart/form-data khi thật sự có chọn file.
        // (Nếu luôn gửi FormData cho PUT, backend có thể không parse req.body -> undefined)
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          const value = formData[key];
          if (value === null || value === undefined) return;
          data.append(key, value);
        });
        response = await fetch(url, {
          method,
          body: data,
          credentials: 'include'
        });
      } else {
        // Update/create không đổi ảnh: gửi JSON để backend đọc req.body ổn định.
        const payload = {
          ...formData,
          // nếu image đang là string (đường dẫn/tên file cũ), giữ nguyên; nếu rỗng thì gửi ''
          image: typeof formData.image === 'string' ? formData.image : ''
        };
        response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      }

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : await response.text();
      console.log("Response từ server:", result);

      if (response.ok || response.status === 201) {
        // Backend GET /api/product đang không trả product_code (aggregate theo product_name),
        // nên dù update DB thành công thì fetchAll() cũng không “hiện mã” được.
        // Vì vậy cập nhật ngay state để danh sách phản ánh thay đổi vừa lưu.
        if (editingId) {
          setProducts((prev) => prev.map((p) => (
            p.product_id === editingId ? {
              ...p,
              product_code: formData.product_code,
              product_name: formData.product_name,
              category_id: formData.category_id,
              unit_id: formData.unit_id,
              selling_price: formData.selling_price,
              description: formData.description,
              active_ingredient: formData.active_ingredient,
              storage_condition: formData.storage_condition,
              supplier_id: formData.supplier_id,
              // Nếu có upload file thì imagePreview sẽ hiển thị ngay trong modal, còn list sẽ sync sau
              image: (typeof formData.image === 'string') ? formData.image : p.image
            } : p
          )));
        }
        setShowModal(false);
        fetchAll();
        // Trigger lại fetch inventory để cập nhật số lượng
        setInventoryRefreshTrigger(prev => prev + 1);
        alert(editingId ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!");
      } else {
        const msg = (result && typeof result === 'object')
          ? (result.message || result.error)
          : String(result);
        alert(msg || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };


  // === LOGIC MỚI: QUẢN LÝ XUẤT KHO (ĐÃ SỬA - CHỌN SẢN PHẨM TRỰC TIẾP) ===
  const handleAddNewExport = () => {
    setExportFormData({
      customer: '',
      note: '',
      products: []
    });
    setShowExportModal(true);
  };

  const handleAddExportRow = () => {
    setExportFormData(prev => ({
      ...prev,
      products: [...prev.products, { product_id: '', export_quantity: 1, export_price: 0, unit_id: '', product_name: '' }]
    }));
  };

  const handleExportProductChange = (index, productId) => {
    const selectedProd = products.find(p => p.product_id === parseInt(productId));
    if (!selectedProd) return;

    setExportFormData(prev => {
      const newProds = [...prev.products];
      newProds[index] = {
        ...newProds[index],
        product_id: selectedProd.product_id,
        product_name: selectedProd.product_name,
        unit_id: selectedProd.unit_id,
        unit_name: selectedProd.unit_name,
        export_price: selectedProd.selling_price || 0
      };
      return { ...prev, products: newProds };
    });
  };

  const handleExportInputChange = (index, field, value) => {
    setExportFormData(prev => {
      const newProds = [...prev.products];
      newProds[index][field] = value;
      return { ...prev, products: newProds };
    });
  };

  const handleSaveExport = async (e) => {
    e.preventDefault();
    if (exportFormData.products.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm");

    const payload = {
      note: exportFormData.note,
      customer: exportFormData.customer,
      products: exportFormData.products.map(p => ({
        product_id: p.product_id,
        export_quantity: Number(p.export_quantity),
        export_price: Number(p.export_price),
        unit_id: p.unit_id
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/api/export_batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok) {
        alert("Xuất kho thành công!");
        setShowExportModal(false);
        fetchAll();
        // Trigger lại fetch inventory để cập nhật số lượng
        setInventoryRefreshTrigger(prev => prev + 1);
      } else {
        alert(result.message || "Lỗi khi xuất kho");
      }
    } catch (err) { 
      alert("Lỗi kết nối server"); 
      logErrorToBackend('AdminPage', `Lỗi xuất kho: ${err.message}`);
    }
  };

  // === LOGIC MỚI: QUẢN LÝ NHẬP KHO ===
  const handleAddBatchProductRow = () => {
    // Mở modal thay vì thêm trực tiếp
    setBatchProductFormData({
      product_code: '',
      product_name: '',
      category_id: '',
      unit_id: '',
      import_price: '',
      quantity: '',
      selling_price: '',
      manufacture_date: '',
      expiry_date: '',
      active_ingredient: '',
      storage_condition: '',
      description: ''
    });
    setShowBatchProductModal(true);
  };

  const handleBatchProductModalInputChange = (e) => {
    const { name, value } = e.target;
    setBatchProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveBatchProduct = () => {
    // Validate required fields
    if (!batchProductFormData.product_code.trim() || !batchProductFormData.product_name.trim() || !batchProductFormData.unit_id) {
      alert('Vui lòng nhập: Mã SP, Tên SP và Đơn vị');
      return;
    }

    // Thêm sản phẩm vào mảng
    setBatchFormData(prev => ({
      ...prev,
      products: [...prev.products, batchProductFormData]
    }));

    // Đóng modal
    setShowBatchProductModal(false);
  };

  const handleRemoveBatchProductRow = (index) => {
    setBatchFormData(prev => {
      const newProducts = [...prev.products];
      newProducts.splice(index, 1);
      return { ...prev, products: newProducts };
    });
  };

  const handleBatchProductChange = (index, e) => {
    const { name, value } = e.target;
    setBatchFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [name]: value };
      return { ...prev, products: newProducts };
    });
  };

  const handleBatchInputChange = (e) => {
    const { name, value } = e.target;
    setBatchFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewBatch = () => {
    setEditingBatchId(null);
    setBatchFormData({
      batch_number: '', supplier_id: '', total_price: 0,
      products: [{ 
        product_code: '', product_name: '', category_id: '', unit_id: '',
        selling_price: '', image: '', description: '', active_ingredient: '', 
        storage_condition: '', manufacture_date: '', expiry_date: '', import_price: '', quantity: ''
      }]
    });
    setShowBatchModal(true);
  };

  const handleEditBatch = async (batch) => {
    setEditingBatchId(batch.batch_id);
    try {
      const res = await fetch(`${API_BASE}/api/import_batch/${batch.batch_id}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const details = json.data || [];
        setBatchFormData({
          batch_number: batch.batch_number || '',
          supplier_id: batch.supplier_id || '',
          total_price: batch.total_price || 0,
          products: details.map(d => ({
            batch_detail_id: d.batch_detail_id, 
            product_id: d.product_id,           
            product_code: d.product_code || '',
            product_name: d.product_name || '',
            category_id: d.category_id || '',
            unit_id: d.unit_id || '',
            selling_price: d.selling_price || '',
            image: d.image || '',
            description: d.description || '',
            active_ingredient: d.active_ingredient || '',
            storage_condition: d.storage_condition || '',
            manufacture_date: d.manufacture_date ? d.manufacture_date.split('T')[0] : '', 
            expiry_date: d.expiry_date ? d.expiry_date.split('T')[0] : '',
            import_price: d.import_price || '',
            quantity: d.quantity || ''
          }))
        });
        setShowBatchModal(true);
      }
    } catch (err) {
      alert("Lỗi khi tải chi tiết phiếu nhập!");
      logErrorToBackend('AdminPage', `Lỗi tải chi tiết phiếu nhập: ${err.message}`);
    }
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (batchFormData.products.length === 0) {
      alert("Phải có ít nhất 1 sản phẩm trong phiếu nhập!");
      return;
    }
    
    // Lấy user_id từ currentUser hoặc localStorage
    let userId = currentUser?.user_id;
    if (!userId) {
      try {
        const userStr = localStorage.getItem('sps_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.user_id;
        }
      } catch (e) {
        console.error("Lỗi lấy user_id:", e);
      }
    }
    
    // Nếu vẫn không có user_id, dùng giá trị mặc định
    if (!userId) {
      userId = 3;
    }
    
    const payload = {
      ...batchFormData,
      user_id: userId 
    };

    const url = editingBatchId ? `${API_BASE}/api/import_batch/${editingBatchId}` : `${API_BASE}/api/import_batch`;
    const method = editingBatchId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const result = await response.json();
      if (response.ok || response.status === 201) {
        setShowBatchModal(false);
        fetchAll();
        // Trigger lại fetch inventory để cập nhật số lượng
        setInventoryRefreshTrigger(prev => prev + 1);
        alert(editingBatchId ? "Cập nhật phiếu nhập thành công!" : "Tạo phiếu nhập kho thành công!");
      } else {
        alert(result.message || result.error || "Có lỗi xảy ra khi lưu phiếu nhập");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối khi lưu phiếu nhập!");
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập này? Mọi sản phẩm trong lô sẽ bị xóa!")) return;
    try {
      const response = await fetch(`${API_BASE}/api/import_batch/${batchId}`, {
        method: 'DELETE', credentials: 'include', headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        alert("Đã xóa phiếu nhập thành công!");
        fetchAll();
        // Trigger lại fetch inventory để cập nhật số lượng
        setInventoryRefreshTrigger(prev => prev + 1);
      } else {
        const result = await response.json();
        alert(result.message || "Xóa thất bại!");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối khi xóa!");
    }
  };

  // === LOGIC MỚI: QUẢN LÝ XUẤT KHO (ĐÃ SỬA - CHỌN SẢN PHẨM TRỰC TIẾP) ===

  const handleViewExportDetail = async (ticketId) => {
    try {
      const res = await fetch(`${API_BASE}/api/export_batch/${ticketId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSelectedExportTicket(data.ticket || data);
        setExportTicketDetails(data.details || []);
        setShowExportDetailModal(true);
      } else {
        alert("Không thể lấy chi tiết phiếu xuất");
      }
    } catch (err) {
      alert("Lỗi tải chi tiết");
      logErrorToBackend('AdminPage', `Lỗi xem chi tiết xuất: ${err.message}`);
    }
  };

  const handleDeleteExport = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy phiếu xuất này? Số lượng sẽ được hoàn lại kho!")) return;
    try {
      const res = await fetch(`${API_BASE}/api/export_batch/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { 
        fetchAll(); 
        // Trigger lại fetch inventory để cập nhật số lượng
        setInventoryRefreshTrigger(prev => prev + 1);
        alert("Đã hủy phiếu xuất"); 
      }
    } catch (err) { 
      alert("Lỗi khi xóa"); 
      logErrorToBackend('AdminPage', `Lỗi xóa phiếu xuất: ${err.message}`);
    }
  };

  // Xác định prop gửi xuống Sidebar để làm sáng menu (đồng bộ với URL)
  const currentSidebarPage = location.pathname === '/qlnhapkho' ? 'qlnhapkho' : (location.pathname === '/qlxuatkho' ? 'qlxuatkho' : 'qlhh');

  return (
    <div className="admin-body">
      {/* TRUYỀN prop currentSidebarPage XUỐNG ĐỂ SÁNG ĐÚNG MENU */}
      <Sidebar 
        toggleChat={toggleChat} 
        activePage={currentSidebarPage}
        purchaseHistory={purchaseHistory}
        importBatches={importBatches}
        exportTickets={exportTickets}
      />
      
      <div className="main-admin">
        <div className="header-row">
          <div>
            <h1 className="page-title">Hàng hóa & Giao dịch</h1>
            {error && <div style={{ background: '#fee', color: '#c33', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '14px' }}>⚠️ {error}</div>}
            <div className="tabs-container">
              
              {/* Nếu đang ở trang Hàng hóa (/qlhh) mới hiện ra Tab Hàng Hoá và Lịch sử */}
              {location.pathname === '/qlhh' && (
                <>
                  <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                    Danh mục hàng hóa
                  </button>
                  <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    Lịch sử mua hàng
                  </button>
                </>
              )}

              {/* Nếu đang ở trang Quản lý nhập kho (/qlnhapkho) thì chỉ hiện mỗi tab này (hoặc 1 chữ đại diện cho trang) */}
              {location.pathname === '/qlnhapkho' && (
                <button className="tab-btn active">
                   Danh sách Phiếu nhập kho
                </button>
              )}

              {/* Nếu đang ở trang Quản lý xuất kho (/qlxuatkho) */}
              {location.pathname === '/qlxuatkho' && (
                <button className="tab-btn active">
                   Danh sách Phiếu xuất kho
                </button>
              )}

            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <button className="refresh-btn" onClick={fetchAll}>
              <i className="fa fa-sync-alt"></i> Làm mới
            </button>
            {activeTab === 'import' && (
              <button className="add-btn" onClick={handleAddNewBatch}>+ Tạo Phiếu Nhập Kho</button>
            )}
            {activeTab === 'export' && (
              <button className="add-btn" onClick={handleAddNewExport}>+ Tạo Phiếu Xuất</button>
            )}
          </div>
        </div>

        {/* TAB SẢN PHẨM */}
        {activeTab === 'products' && (
          <div className="table-wrap">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ẢNH</th><th>MÃ SP</th><th>TÊN</th><th>DANH MỤC</th><th>ĐƠN VỊ</th><th>SỐ LƯỢNG</th><th>GIÁ BÁN</th><th>MÔ TẢ</th><th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (<span style={{color: '#999', fontSize: '12px'}}>Không có ảnh</span>)}
                    </td>
                    <td>{p.product_code || <span style={{ color: '#999' }}>(Chưa có)</span>}</td>
                    <td>{p.product_name}</td>
                    <td>{p.category_name || 'N/A'}</td>
                    <td>{p.unit_name || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>
                      {p.total_available !== undefined && p.total_available !== null
                        ? p.total_available
                        : 'N/A'}
                    </td>
                    <td>{Number(p.selling_price || 0).toLocaleString()} VNĐ</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.description || 'N/A'}>{p.description || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleEdit(p)} className="btn-edit">Sửa</button>
                      <button onClick={(e) => handleDeleteClick(p.product_id, e)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB QUẢN LÝ NHẬP KHO */}
        {activeTab === 'import' && (
          <div className="table-wrap">
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => exportImportBatchesToExcel(importBatches)}
                style={{
                  background: '#70AD47',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                📊 Xuất Excel
              </button>
            </div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>MÃ PHIẾU</th>
                  <th>NHÀ CUNG CẤP</th>
                  <th>TỔNG TIỀN</th>
                  <th>NGƯỜI TẠO</th>
                  <th>NGÀY TẠO</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {importBatches.length > 0 ? importBatches.map((b) => (
                  <tr key={b.batch_id}>
                    <td><strong>{b.batch_number}</strong></td>
                    <td>{b.supplier_name || 'N/A'}</td>
                    <td style={{ color: '#d9534f', fontWeight: 'bold' }}>{Number(b.total_price || 0).toLocaleString()} VNĐ</td>
                    <td>{b.creator_name || 'N/A'}</td>
                    <td>{b.create_date_formatted || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleEditBatch(b)} className="btn-edit">Chi tiết / Sửa</button>
                      <button onClick={() => handleDeleteBatch(b.batch_id)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" style={{textAlign: 'center'}}>Chưa có phiếu nhập kho nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB LỊCH SỬ MUA HÀNG */}
        {activeTab === 'history' && (
          <div className="table-wrap">
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => exportPurchaseHistoryToExcel(purchaseHistory)}
                style={{
                  background: '#4472C4',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                📊 Xuất Excel
              </button>
            </div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>MÃ LỰC</th>
                  <th>KHÁCH HÀNG</th>
                  <th>SẢN PHẨM</th>
                  <th>ĐƠN VỊ</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TỔNG TIỀN</th>
                  <th>HÌNH THỨC THANH TOÁN</th>
                  <th>ĐỊA CHỈ</th>
                  <th>NGÀY MUA</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory && purchaseHistory.length > 0 ? (
                  purchaseHistory.map((history) => (
                    <tr key={history.user_history_id}>
                      <td><strong>#{history.user_history_id}</strong></td>
                      <td>{history.username || 'N/A'}</td>
                      <td>{history.product_name || 'N/A'}</td>
                      <td>{history.unit_name || 'N/A'}</td>
                      <td style={{ textAlign: 'center', fontWeight: '500' }}>{history.quantity || 0}</td>
                      <td style={{ color: '#28a745', fontWeight: 'bold' }}>{Number(history.total_price || 0).toLocaleString()} VNĐ</td>
                      <td>{history.payment || 'N/A'}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={history.address || 'N/A'}>{history.address || 'N/A'}</td>
                      <td>{history.date_formatted || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Chưa có lịch sử mua hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB QUẢN LÝ XUẤT KHO */}
        {activeTab === 'export' && (
          <div className="table-wrap">
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => exportExportTicketsToExcel(exportTickets)}
                style={{
                  background: '#C00000',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                📊 Xuất Excel
              </button>
            </div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>MÃ PHIẾU</th>
                  <th>KHÁCH HÀNG</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TỔNG GIÁ TRỊ</th>
                  <th>NGƯỜI XUẤT</th>
                  <th>NGÀY XUẤT</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {exportTickets.map(t => (
                  <tr key={t.ticket_id}>
                    <td><strong>PX-{t.ticket_id}</strong></td>
                    <td>{t.customer || 'Khách lẻ'}</td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{t.total_quantity || 0}</td>
                    <td style={{color: '#28a745', fontWeight: 'bold'}}>{Number(t.total_price).toLocaleString()} VNĐ</td>
                    <td>{t.full_name}</td>
                    <td>{t.created_at_formatted || new Date(t.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                    <td>
                      <button onClick={() => handleViewExportDetail(t.ticket_id)} className="btn-edit">Xem chi tiết</button>
                      <button onClick={() => handleDeleteExport(t.ticket_id)} className="btn-delete">Hủy phiếu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <Chatbot 
        isOpen={isChatOpen} 
        toggleChat={toggleChat}
        purchaseHistory={purchaseHistory}
        importBatches={importBatches}
        exportTickets={exportTickets}
      />

      {/* MODAL THÊM / SỬA SẢN PHẨM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSave} className="product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Danh mục:</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleInputChange} 
                    required 
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {Object.entries(categoriesMap).map(([id, cat]) => (
                      <option key={id} value={id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mã SP:</label>
                  <input type="text" name="product_code" value={formData.product_code} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Tên SP:</label>
                  <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Đơn vị:</label>
                  <select 
                    name="unit_id" 
                    value={formData.unit_id} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {unitsList.map((u) => (
                      <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá bán:</label>
                  <input type="number" name="selling_price" value={formData.selling_price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Hoạt chất:</label>
                  <input type="text" name="active_ingredient" value={formData.active_ingredient} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Bảo quản:</label>
                  <input type="text" name="storage_condition" value={formData.storage_condition} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Mô tả:</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Hình ảnh sản phẩm:</label>
                  <div className="upload-section">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>Hoặc dán link ảnh:</p>
                    <input type="text" name="image" value={typeof formData.image === 'string' ? formData.image : ''} 
                           onChange={handleInputChange} placeholder="https://..." />
                  </div>
                  {imagePreview && (
                    <div className="preview-container">
                      <img src={imagePreview} alt="Preview" className="img-preview-rect" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">{editingId ? "Cập nhật" : "Lưu sản phẩm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA PHIẾU NHẬP KHO */}
      {showBatchModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '1200px' }}>
            <div className="modal-header">
              <h2>{editingBatchId ? `Cập nhật Phiếu Nhập: ${batchFormData.batch_number}` : "Tạo Phiếu Nhập Kho Mới"}</h2>
              <button className="close-btn" onClick={() => setShowBatchModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveBatch} className="product-form">
              {/* Thông tin chung của phiếu */}
              <div className="form-grid" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <div className="form-group">
                  <label>Mã Lô/Phiếu nhập:</label>
                  <input type="text" name="batch_number" value={batchFormData.batch_number} onChange={handleBatchInputChange} placeholder="VD: PN2026-04..." required />
                </div>
                <div className="form-group">
                  <label>Nhà cung cấp:</label>
                  <select name="supplier_id" value={batchFormData.supplier_id} onChange={handleBatchInputChange}>
                    <option value="">-- Chọn Nhà cung cấp --</option>
                    {suppliersList.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tổng giá trị phiếu (Tự động tính):</label>
                  <input type="text" value={`${Number(batchFormData.total_price).toLocaleString()} VNĐ`} readOnly style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#d9534f' }} />
                </div>
              </div>

              {/* Danh sách sản phẩm nhập vào */}
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>Chi tiết Sản phẩm nhập ({batchFormData.products.length})</h3>
                <button type="button" className="btn-edit" onClick={handleAddBatchProductRow} style={{ backgroundColor: '#ffc107', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>+ Thêm dòng sản phẩm</button>
              </div>

              {/* Bảng hiển thị sản phẩm nhập */}
              <div style={{ overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #e8e8e8' }}>
                <table className="import-products-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>MÃ SP (*)</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>TÊN SẢN PHẨM (*)</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>DANH MỤC</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>ĐƠN VỊ (*)</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#333' }}>SỐ LƯỢNG</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#333' }}>GIÁ BÁN (VNĐ)</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>HOẠT CHẤT</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>BẢO QUẢN</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#333' }}>MÔ TẢ</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', color: '#333', width: '60px' }}>XÓA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchFormData.products.length > 0 ? (
                      batchFormData.products.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '10px 8px' }}>
                            <input 
                              type="text" 
                              name="product_code" 
                              value={item.product_code} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              required 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input 
                              type="text" 
                              name="product_name" 
                              value={item.product_name} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              required 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <select 
                              name="category_id" 
                              value={item.category_id} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            >
                              <option value="">-- Chọn --</option>
                              {Object.entries(categoriesMap).map(([id, cat]) => <option key={id} value={id}>{cat.name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <select 
                              name="unit_id" 
                              value={item.unit_id} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              required 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            >
                              <option value="">-- Chọn --</option>
                              {unitsList.map((u) => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              name="quantity" 
                              value={item.quantity} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              min="1" 
                              required 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px', textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              name="selling_price" 
                              value={item.selling_price} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              min="0" 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px', textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input 
                              type="text" 
                              name="active_ingredient" 
                              value={item.active_ingredient} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input 
                              type="text" 
                              name="storage_condition" 
                              value={item.storage_condition} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input 
                              type="text" 
                              name="description" 
                              value={item.description} 
                              onChange={(e) => handleBatchProductChange(index, e)} 
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveBatchProductRow(index)} 
                              style={{ background: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0' }} 
                              title="Xóa dòng này"
                            >
                              ✖
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ padding: '20px', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                          Chưa thêm sản phẩm nào. Nhấn "+ Thêm dòng sản phẩm" để bắt đầu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowBatchModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">{editingBatchId ? "Cập nhật Phiếu Nhập" : "Lưu Phiếu Nhập"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL THÊM SẢN PHẨM LÔ HÀNG (NHẬP KHO)
          ============================================ */}
      {showBatchProductModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2>Sửa sản phẩm</h2>
              <button className="close-btn" onClick={() => setShowBatchProductModal(false)}>×</button>
            </div>

            <div className="product-form">
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {/* Hàng 1 */}
                <div className="form-group">
                  <label>Danh mục:</label>
                  <select name="category_id" value={batchProductFormData.category_id} onChange={handleBatchProductModalInputChange}>
                    <option value="">-- Chọn danh mục --</option>
                    {Object.entries(categoriesMap).map(([id, cat]) => <option key={id} value={id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mã SP:</label>
                  <input type="text" name="product_code" value={batchProductFormData.product_code} onChange={handleBatchProductModalInputChange} placeholder="VD: DHG-001" />
                </div>
                <div className="form-group">
                  <label>Đơn vị:</label>
                  <select name="unit_id" value={batchProductFormData.unit_id} onChange={handleBatchProductModalInputChange}>
                    <option value="">-- Chọn đơn vị --</option>
                    {unitsList.map((u) => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                  </select>
                </div>

                {/* Hàng 2 */}
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label>Tên SP:</label>
                  <input type="text" name="product_name" value={batchProductFormData.product_name} onChange={handleBatchProductModalInputChange} placeholder="Nhập tên sản phẩm" />
                </div>

                {/* Hàng 3 */}
                <div className="form-group">
                  <label>Số lượng (*):</label>
                  <input type="number" name="quantity" value={batchProductFormData.quantity} onChange={handleBatchProductModalInputChange} placeholder="0" min="0" required />
                </div>
                <div className="form-group">
                  <label>Giá bán (VNĐ):</label>
                  <input type="number" name="selling_price" value={batchProductFormData.selling_price} onChange={handleBatchProductModalInputChange} placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label>Hoạt chất:</label>
                  <input type="text" name="active_ingredient" value={batchProductFormData.active_ingredient} onChange={handleBatchProductModalInputChange} placeholder="VD: Paracetamol 500mg" />
                </div>

                {/* Hàng 4 */}
                <div className="form-group">
                  <label>Bảo quản:</label>
                  <input type="text" name="storage_condition" value={batchProductFormData.storage_condition} onChange={handleBatchProductModalInputChange} placeholder="VD: Dưới 30 độ C" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}></div>

                {/* Hàng 5 */}
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label>Mô tả:</label>
                  <input type="text" name="description" value={batchProductFormData.description} onChange={handleBatchProductModalInputChange} placeholder="Nhập mô tả sản phẩm" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBatchProductModal(false)}>Hủy</button>
                <button type="button" className="btn-submit" onClick={handleSaveBatchProduct}>Cập nhật</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XUẤT KHO MỚI */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '80%', maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2>Tạo Phiếu Xuất Kho (FEFO)</h2>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveExport}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên khách hàng:</label>
                  <input type="text" value={exportFormData.customer} onChange={(e) => setExportFormData({...exportFormData, customer: e.target.value})} placeholder="Nhập tên khách..." />
                </div>
                <div className="form-group">
                  <label>Ghi chú:</label>
                  <input type="text" value={exportFormData.note} onChange={(e) => setExportFormData({...exportFormData, note: e.target.value})} placeholder="Nhập ghi chú (tuỳ chọn)" />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3>📋 Danh sách sản phẩm xuất (Backend sẽ tự chọn lô FEFO)</h3>
                  <button type="button" className="btn-edit" onClick={handleAddExportRow}>
                    + Thêm sản phẩm
                  </button>
                </div>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>SẢN PHẨM</th>
                      <th>SỐ LƯỢNG XUẤT</th>
                      <th>GIÁ XUẤT (VNĐ)</th>
                      <th>ĐƠN VỊ</th>
                      <th>XÓA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportFormData.products.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <select 
                            value={item.product_id} 
                            onChange={(e) => handleExportProductChange(index, e.target.value)}
                            required
                            style={{ width: '100%' }}
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.filter(p => p.total_available > 0).map(p => (
                              <option key={p.product_id} value={p.product_id}>
                                {p.product_name} (Tồn: {p.total_available})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.export_quantity} 
                            onChange={(e) => handleExportInputChange(index, 'export_quantity', e.target.value)}
                            required
                            style={{ width: '100%', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={item.export_price} 
                            onChange={(e) => handleExportInputChange(index, 'export_price', e.target.value)}
                            required
                            style={{ width: '100%', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.unit_id ? (
                            <span>{item.unit_name || '...'}</span>
                          ) : (
                            <span>...</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newP = [...exportFormData.products];
                              newP.splice(index, 1);
                              setExportFormData({...exportFormData, products: newP});
                            }}
                            style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowExportModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Xác nhận xuất kho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT PHIẾU XUẤT */}
      {showExportDetailModal && selectedExportTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>Chi tiết Phiếu Xuất: PX-{selectedExportTicket.ticket_id}</h2>
              <button className="close-btn" onClick={() => setShowExportDetailModal(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              {/* Thông tin phiếu */}
              <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p><strong>Khách hàng:</strong> {selectedExportTicket.customer || 'Khách lẻ'}</p>
                  <p><strong>Ghi chú:</strong> {selectedExportTicket.note || '-'}</p>
                </div>
                <div>
                  <p><strong>Người xuất:</strong> {selectedExportTicket.full_name || 'N/A'}</p>
                  <p><strong>Ngày xuất:</strong> {selectedExportTicket.created_at}</p>
                </div>
              </div>

              {/* Bảng chi tiết sản phẩm */}
              <h3 style={{ marginBottom: '10px' }}>Danh sách sản phẩm xuất:</h3>
              <table className="products-table" style={{ width: '100%', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th>TÊN SẢN PHẨM</th>
                    <th>SỐ LƯỢNG XUẤT</th>
                    <th>GIÁ XUẤT (VNĐ)</th>
                    <th>ĐƠN VỊ</th>
                  </tr>
                </thead>
                <tbody>
                  {exportTicketDetails.length > 0 ? exportTicketDetails.map((detail, idx) => (
                    <tr key={idx}>
                      <td>{detail.product_name || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>{detail.export_quantity}</td>
                      <td style={{ textAlign: 'right' }}>{Number(detail.export_price || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>{detail.unit_name || detail.unit_id}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>Chưa có chi tiết xuất</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Tổng tiền */}
              <div style={{ textAlign: 'right', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                <p><strong>Tổng giá trị:</strong> <span style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>{Number(selectedExportTicket.total_price).toLocaleString()} VNĐ</span></p>
              </div>

              {/* Nút đóng */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowExportDetailModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;