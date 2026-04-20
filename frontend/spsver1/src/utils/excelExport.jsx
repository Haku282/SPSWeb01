import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Định dạng tiền tệ VNĐ - Chỉ trả về số (Excel sẽ format theo locale)
 */
const formatVND = (value) => {
  if (!value) return 0;
  return Number(value);
};

/**
 * Format tiền để hiển thị trong Excel (với dấu phân cách)
 */
const formatVNDDisplay = (value) => {
  if (!value) return '0';
  return `${Number(value).toLocaleString('vi-VN')}`;
};

/**
 * Xuất Lịch sử mua hàng ra Excel
 */
export const exportPurchaseHistoryToExcel = async (historyData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch sử mua hàng', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Thiết lập độ rộng cột
  worksheet.columns = [
    { header: 'MÃ LỰC', key: 'user_history_id', width: 12 },
    { header: 'KHÁCH HÀNG', key: 'username', width: 18 },
    { header: 'SẢN PHẨM', key: 'product_name', width: 25 },
    { header: 'ĐƠN VỊ', key: 'unit_name', width: 12 },
    { header: 'SỐ LƯỢNG', key: 'quantity', width: 12 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'HÌNH THỨC TT', key: 'payment', width: 15 },
    { header: 'ĐỊA CHỈ', key: 'address', width: 30 },
    { header: 'NGÀY MUA', key: 'date', width: 20 }
  ];

  // Style header
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

  // Thêm dữ liệu
  historyData.forEach((row, index) => {
    const wsRow = worksheet.addRow({
      user_history_id: row.user_history_id,
      username: row.username || 'N/A',
      product_name: row.product_name || 'N/A',
      unit_name: row.unit_name || 'N/A',
      quantity: row.quantity || 0,
      total_price: formatVND(row.total_price),
      payment: row.payment || 'N/A',
      address: row.address || 'N/A',
      date: row.date || 'N/A'
    });

    // Alternating row colors
    if (index % 2 === 0) {
      wsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    }

    wsRow.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    
    // Format cột tiền
    wsRow.getCell(6).numFmt = '#,##0';
  });

  // Thêm tổng cộng
  const totalRow = worksheet.addRow({});
  totalRow.getCell(1).value = 'TỔNG CỘNG';
  totalRow.getCell(1).font = { bold: true };

  const totalPrice = historyData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  totalRow.getCell(6).value = formatVND(totalPrice);
  totalRow.getCell(6).font = { bold: true, color: { argb: 'FFFF0000' } };

  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' }
  };

  // Lưu file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Lich_su_mua_hang_${timestamp}.xlsx`);
};

/**
 * Xuất Danh sách Phiếu Nhập Kho ra Excel
 */
export const exportImportBatchesToExcel = async (batchesData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Phiếu Nhập Kho', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  worksheet.columns = [
    { header: 'MÃ PHIẾU', key: 'batch_number', width: 15 },
    { header: 'NHÀ CUNG CẤP', key: 'supplier_name', width: 20 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'NGƯỜI NHẬP', key: 'creator_name', width: 15 },
    { header: 'NGÀY NHẬP', key: 'create_date_formatted', width: 20 }
  ];

  // Style header
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

  // Thêm dữ liệu
  batchesData.forEach((row, index) => {
    const wsRow = worksheet.addRow({
      batch_number: row.batch_number || 'N/A',
      supplier_name: row.supplier_name || 'N/A',
      total_price: formatVND(row.total_price),
      creator_name: row.creator_name || 'N/A',
      create_date_formatted: row.create_date_formatted || 'N/A'
    });

    if (index % 2 === 0) {
      wsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    }

    wsRow.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    
    // Format cột tiền
    wsRow.getCell(3).numFmt = '#,##0';
  });

  // Tính tổng tiền
  const totalPrice = batchesData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalRow = worksheet.addRow({});
  totalRow.getCell(1).value = 'TỔNG CỘNG';
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(3).value = formatVND(totalPrice);
  totalRow.getCell(3).numFmt = '#,##0';
  totalRow.getCell(3).font = { bold: true, color: { argb: 'FFFF0000' } };

  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFD8B' }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Phieu_nhap_kho_${timestamp}.xlsx`);
};

/**
 * Xuất Danh sách Phiếu Xuất Kho ra Excel
 */
export const exportExportTicketsToExcel = async (ticketsData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Phiếu Xuất Kho', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  worksheet.columns = [
    { header: 'MÃ PHIẾU', key: 'ticket_id', width: 12 },
    { header: 'KHÁCH HÀNG', key: 'customer', width: 20 },
    { header: 'TỔNG SL', key: 'total_quantity', width: 12 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'NGƯỜI XUẤT', key: 'full_name', width: 15 },
    { header: 'GHI CHÚ', key: 'note', width: 25 },
    { header: 'NGÀY XUẤT', key: 'created_at', width: 20 }
  ];

  // Style header
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC00000' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

  // Thêm dữ liệu
  ticketsData.forEach((row, index) => {
    const wsRow = worksheet.addRow({
      ticket_id: row.ticket_id || 'N/A',
      customer: row.customer || 'Khách lẻ',
      total_quantity: row.total_quantity || 0,
      total_price: formatVND(row.total_price),
      full_name: row.full_name || 'N/A',
      note: row.note || '',
      created_at: row.created_at_formatted || row.created_at || 'N/A'
    });

    if (index % 2 === 0) {
      wsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    }

    wsRow.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    
    // Format cột tiền
    wsRow.getCell(4).numFmt = '#,##0';
  });

  // Tính tổng tiền
  const totalPrice = ticketsData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalQuantity = ticketsData.reduce((sum, item) => sum + (Number(item.total_quantity) || 0), 0);
  
  const totalRow = worksheet.addRow({});
  totalRow.getCell(1).value = 'TỔNG CỘNG';
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(3).value = totalQuantity;
  totalRow.getCell(3).font = { bold: true };
  totalRow.getCell(4).value = formatVND(totalPrice);
  totalRow.getCell(4).numFmt = '#,##0';
  totalRow.getCell(4).font = { bold: true, color: { argb: 'FFFF0000' } };

  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Phieu_xuat_kho_${timestamp}.xlsx`);
};

/**
 * Xuất Báo cáo Tổng hợp (3 sheet trong 1 file)
 */
export const exportComprehensiveReportToExcel = async (historyData, batchesData, ticketsData) => {
  const workbook = new ExcelJS.Workbook();

  // ========== SHEET 1: LỊCH SỬ MUA HÀNG ==========
  const sheet1 = workbook.addWorksheet('Lịch sử mua hàng', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  sheet1.columns = [
    { header: 'MÃ LỰC', key: 'user_history_id', width: 12 },
    { header: 'KHÁCH HÀNG', key: 'username', width: 18 },
    { header: 'SẢN PHẨM', key: 'product_name', width: 25 },
    { header: 'ĐƠN VỊ', key: 'unit_name', width: 12 },
    { header: 'SỐ LƯỢNG', key: 'quantity', width: 12 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'HÌNH THỨC TT', key: 'payment', width: 15 },
    { header: 'ĐỊA CHỈ', key: 'address', width: 30 },
    { header: 'NGÀY MUA', key: 'date', width: 20 }
  ];

  sheet1.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  historyData.forEach((row, index) => {
    const wsRow = sheet1.addRow({
      user_history_id: row.user_history_id,
      username: row.username || 'N/A',
      product_name: row.product_name || 'N/A',
      unit_name: row.unit_name || 'N/A',
      quantity: row.quantity || 0,
      total_price: formatVND(row.total_price),
      payment: row.payment || 'N/A',
      address: row.address || 'N/A',
      date: row.date || 'N/A'
    });

    if (index % 2 === 0) {
      wsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    }
    
    wsRow.getCell(6).numFmt = '#,##0';
  });

  const totalHistoryPrice = historyData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalHistoryRow = sheet1.addRow({});
  totalHistoryRow.getCell(1).value = 'TỔNG CỘNG';
  totalHistoryRow.getCell(1).font = { bold: true };
  totalHistoryRow.getCell(6).value = formatVND(totalHistoryPrice);
  totalHistoryRow.getCell(6).numFmt = '#,##0';
  totalHistoryRow.getCell(6).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalHistoryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

  // ========== SHEET 2: PHIẾU NHẬP KHO ==========
  const sheet2 = workbook.addWorksheet('Phiếu nhập kho', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  sheet2.columns = [
    { header: 'MÃ PHIẾU', key: 'batch_number', width: 15 },
    { header: 'NHÀ CUNG CẤP', key: 'supplier_name', width: 20 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'NGƯỜI NHẬP', key: 'creator_name', width: 15 },
    { header: 'NGÀY NHẬP', key: 'create_date_formatted', width: 20 }
  ];

  sheet2.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  batchesData.forEach((row, index) => {
    const wsRow = sheet2.addRow({
      batch_number: row.batch_number || 'N/A',
      supplier_name: row.supplier_name || 'N/A',
      total_price: formatVND(row.total_price),
      creator_name: row.creator_name || 'N/A',
      create_date_formatted: row.create_date_formatted || 'N/A'
    });

    if (index % 2 === 0) {
      wsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    }
    
    wsRow.getCell(3).numFmt = '#,##0';
  });

  const totalBatchesPrice = batchesData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalBatchesRow = sheet2.addRow({});
  totalBatchesRow.getCell(1).value = 'TỔNG CỘNG';
  totalBatchesRow.getCell(1).font = { bold: true };
  totalBatchesRow.getCell(3).value = formatVND(totalBatchesPrice);
  totalBatchesRow.getCell(3).numFmt = '#,##0';
  totalBatchesRow.getCell(3).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalBatchesRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFD8B' } };

  // ========== SHEET 3: PHIẾU XUẤT KHO ==========
  const sheet3 = workbook.addWorksheet('Phiếu xuất kho', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  sheet3.columns = [
    { header: 'MÃ PHIẾU', key: 'ticket_id', width: 12 },
    { header: 'KHÁCH HÀNG', key: 'customer', width: 20 },
    { header: 'TỔNG SL', key: 'total_quantity', width: 12 },
    { header: 'TỔNG TIỀN', key: 'total_price', width: 15 },
    { header: 'NGƯỜI XUẤT', key: 'full_name', width: 15 },
    { header: 'GHI CHÚ', key: 'note', width: 25 },
    { header: 'NGÀY XUẤT', key: 'created_at', width: 20 }
  ];

  sheet3.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC00000' }
  };
  sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  ticketsData.forEach((row, index) => {
    const wsRow = sheet3.addRow({
      ticket_id: row.ticket_id || 'N/A',
      customer: row.customer || 'Khách lẻ',
      total_quantity: row.total_quantity || 0,
      total_price: formatVND(row.total_price),
      full_name: row.full_name || 'N/A',
      note: row.note || '',
      created_at: row.created_at_formatted || row.created_at || 'N/A'
    });

    if (index % 2 === 0) {
      wsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    }
    
    wsRow.getCell(4).numFmt = '#,##0';
  });

  const totalTicketsPrice = ticketsData.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalTicketsQuantity = ticketsData.reduce((sum, item) => sum + (Number(item.total_quantity) || 0), 0);
  
  const totalTicketsRow = sheet3.addRow({});
  totalTicketsRow.getCell(1).value = 'TỔNG CỘNG';
  totalTicketsRow.getCell(1).font = { bold: true };
  totalTicketsRow.getCell(3).value = totalTicketsQuantity;
  totalTicketsRow.getCell(3).font = { bold: true };
  totalTicketsRow.getCell(4).value = formatVND(totalTicketsPrice);
  totalTicketsRow.getCell(4).numFmt = '#,##0';
  totalTicketsRow.getCell(4).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalTicketsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

  // ========== SHEET 4: SUMMARY (TÓM TẮT DOANH THU) ==========
  const sheet4 = workbook.addWorksheet('Tóm tắt doanh thu', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  sheet4.columns = [
    { header: 'LOẠI BÁO CÁO', key: 'type', width: 25 },
    { header: 'TỔNG SỐ BẢN GHI', key: 'count', width: 15 },
    { header: 'TỔNG TIỀN (VNĐ)', key: 'total', width: 20 }
  ];

  sheet4.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' }
  };
  sheet4.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };

  const summaryData = [
    {
      type: '📝 Lịch sử mua hàng',
      count: historyData.length,
      total: formatVND(totalHistoryPrice)
    },
    {
      type: '📥 Phiếu nhập kho',
      count: batchesData.length,
      total: formatVND(totalBatchesPrice)
    },
    {
      type: '📤 Phiếu xuất kho',
      count: ticketsData.length,
      total: formatVND(totalTicketsPrice)
    }
  ];

  summaryData.forEach((row, index) => {
    const wsRow = sheet4.addRow({
      type: row.type,
      count: row.count,
      total: row.total
    });

    wsRow.getCell(1).font = { bold: true };
    wsRow.getCell(3).numFmt = '#,##0';
    wsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
  });

  // Tổng cộng toàn bộ
  const grandTotal = totalHistoryPrice + totalBatchesPrice + totalTicketsPrice;
  const grandTotalRow = sheet4.addRow({});
  grandTotalRow.getCell(1).value = '🎯 TỔNG DOANH THU TOÀN BỘ';
  grandTotalRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFF0000' } };
  grandTotalRow.getCell(3).value = formatVND(grandTotal);
  grandTotalRow.getCell(3).numFmt = '#,##0';
  grandTotalRow.getCell(3).font = { bold: true, size: 12, color: { argb: 'FFFF0000' } };
  grandTotalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Bao_cao_tong_hop_${timestamp}.xlsx`);
};
