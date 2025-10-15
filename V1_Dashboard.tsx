import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, TrendingUp, ShoppingCart, AlertTriangle, DollarSign, Package, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [globalFilters, setGlobalFilters] = useState({
    yearFrom: '',
    yearTo: '',
    region: ''
  });
  const [salesByMonthFilters, setSalesByMonthFilters] = useState({
    yearFrom: '',
    yearTo: '',
    monthFrom: '',
    monthTo: ''
  });
  const [topProductsFilters, setTopProductsFilters] = useState({
    yearFrom: '',
    yearTo: '',
    monthFrom: '',
    monthTo: ''
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const parsedData = parseCSV(content);
        setData(parsedData);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setData(parsedData);
      }
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const applyDateFilter = (row, filters) => {
    const fecha = row['Fecha de venta'];
    if (!fecha) return false;

    const [day, month, year] = fecha.split('-');
    const rowYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const rowMonth = parseInt(month);

    if (filters.yearFrom && rowYear < parseInt(filters.yearFrom)) return false;
    if (filters.yearTo && rowYear > parseInt(filters.yearTo)) return false;
    if (filters.monthFrom && rowMonth < parseInt(filters.monthFrom)) return false;
    if (filters.monthTo && rowMonth > parseInt(filters.monthTo)) return false;

    return true;
  };

  const globalFilteredData = useMemo(() => {
    return data.filter(row => {
      if (globalFilters.region && row['Estado.1'] !== globalFilters.region) return false;
      return applyDateFilter(row, globalFilters);
    });
  }, [data, globalFilters]);

  const kpis = useMemo(() => {
    const validSales = globalFilteredData.filter(row => 
      row['Estado'] === 'Entregado' || row['Estado'] === 'Venta concretada'
    );

    const totalAmount = validSales.reduce((sum, row) => {
      const total = parseFloat(row['Total (CLP)']?.replace(/[^0-9.-]/g, '') || 0);
      return sum + total;
    }, 0);

    const avgTicket = validSales.length > 0 ? totalAmount / validSales.length : 0;

    const canceladas = globalFilteredData.filter(row => 
      row['Estado']?.includes('Cancelada') || row['Estado']?.includes('Cancelaste')
    ).length;

    const problematicas = globalFilteredData.filter(row => 
      row['Estado']?.includes('Devol') || row['Estado']?.includes('no entregado')
    ).length;

    const regionMap = {};
    const comunaMap = {};
    
    validSales.forEach(row => {
      const region = row['Estado.1'] || 'Sin región';
      const comuna = row['Comuna'] || 'Sin comuna';
      regionMap[region] = (regionMap[region] || 0) + 1;
      comunaMap[comuna] = (comunaMap[comuna] || 0) + 1;
    });

    return {
      avgTicket,
      totalAmount,
      totalSales: validSales.length,
      canceladas,
      problematicas,
      regionesCount: Object.keys(regionMap).length,
      comunasCount: Object.keys(comunaMap).length
    };
  }, [globalFilteredData]);

  const salesByMonth = useMemo(() => {
    const monthMap = {};
    
    data.filter(row => applyDateFilter(row, salesByMonthFilters)).forEach(row => {
      if (row['Estado'] !== 'Entregado' && row['Estado'] !== 'Venta concretada') return;
      
      const fecha = row['Fecha de venta'];
      if (!fecha) return;

      const parts = fecha.split('-');
      if (parts.length !== 3) return;
      
      const [day, month, year] = parts;
      const yearNum = parseInt(year);
      const fullYear = yearNum > 50 ? 1900 + yearNum : 2000 + yearNum;
      const monthNum = month.padStart(2, '0');
      const sortKey = `${fullYear}-${monthNum}`;
      const displayKey = `${monthNum}/${fullYear}`;
      
      if (!monthMap[sortKey]) {
        monthMap[sortKey] = { month: displayKey, sortKey: sortKey, cantidad: 0, monto: 0 };
      }
      
      monthMap[sortKey].cantidad += 1;
      monthMap[sortKey].monto += parseFloat(row['Total (CLP)']?.replace(/[^0-9.-]/g, '') || 0);
    });

    return Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, salesByMonthFilters]);

  const topProducts = useMemo(() => {
    const productMap = {};
    
    data.filter(row => applyDateFilter(row, topProductsFilters)).forEach(row => {
      if (row['Estado'] !== 'Entregado' && row['Estado'] !== 'Venta concretada') return;
      
      const sku = row['SKU'] || 'Sin SKU';
      const title = row['Título de la publicación'] || row['TÃ­tulo de la publicaciÃ³n'] || 'Sin título';
      const key = `${sku}`;
      
      if (!productMap[key]) {
        productMap[key] = { 
          sku, 
          title: title.substring(0, 35),
          fullTitle: title,
          cantidad: 0, 
          monto: 0 
        };
      }
      
      const units = parseInt(row['Unidades'] || 0);
      productMap[key].cantidad += units;
      productMap[key].monto += parseFloat(row['Total (CLP)']?.replace(/[^0-9.-]/g, '') || 0);
    });

    return Object.values(productMap)
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10);
  }, [data, topProductsFilters]);

  const clientsByRegion = useMemo(() => {
    const regionMap = {};
    
    globalFilteredData.forEach(row => {
      if (row['Estado'] !== 'Entregado' && row['Estado'] !== 'Venta concretada') return;
      
      const region = row['Estado.1'] || 'Sin región';
      
      if (!regionMap[region]) {
        regionMap[region] = 0;
      }
      
      regionMap[region]++;
    });

    return Object.entries(regionMap)
      .map(([region, clientes]) => ({ region, clientes }))
      .sort((a, b) => b.clientes - a.clientes)
      .slice(0, 10);
  }, [globalFilteredData]);

  const statusDistribution = useMemo(() => {
    const statusMap = {
      'Entregado': 0,
      'Canceladas': 0,
      'Devueltas/No entregadas': 0,
      'Demorados': 0,
      'Otros': 0
    };

    globalFilteredData.forEach(row => {
      const estado = row['Estado']?.toLowerCase() || '';
      if (estado.includes('entregado')) {
        statusMap['Entregado']++;
      } else if (estado.includes('cancelada') || estado.includes('cancelaste')) {
        statusMap['Canceladas']++;
      } else if (estado.includes('devol') || estado.includes('no entregado')) {
        statusMap['Devueltas/No entregadas']++;
      } else if (estado.includes('demora') || estado.includes('reputacion')) {
        statusMap['Demorados']++;
      } else {
        statusMap['Otros']++;
      }
    });

    return Object.entries(statusMap)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [globalFilteredData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
  };

  const uniqueYears = useMemo(() => {
    const years = new Set();
    data.forEach(row => {
      const fecha = row['Fecha de venta'];
      if (fecha) {
        const [, , year] = fecha.split('-');
        const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
        years.add(fullYear.toString());
      }
    });
    return Array.from(years).sort();
  }, [data]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set();
    data.forEach(row => {
      if (row['Estado.1']) regions.add(row['Estado.1']);
    });
    return Array.from(regions).sort();
  }, [data]);

  const months = [
    {value: '1', label: 'Enero'}, {value: '2', label: 'Febrero'}, {value: '3', label: 'Marzo'},
    {value: '4', label: 'Abril'}, {value: '5', label: 'Mayo'}, {value: '6', label: 'Junio'},
    {value: '7', label: 'Julio'}, {value: '8', label: 'Agosto'}, {value: '9', label: 'Septiembre'},
    {value: '10', label: 'Octubre'}, {value: '11', label: 'Noviembre'}, {value: '12', label: 'Diciembre'}
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-[1920px] mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={28} />
            Dashboard BI - Ventas Mercado Libre
          </h1>
        </header>

        {data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Upload className="mx-auto text-blue-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Cargar archivo de datos</h2>
            <p className="text-slate-600 mb-6">Sube un archivo CSV, TXT o Excel con los datos de ventas</p>
            <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
              Seleccionar archivo
              <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <h3 className="text-base font-semibold text-slate-800 mb-3">Filtros Globales</h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Año desde</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                    value={globalFilters.yearFrom}
                    onChange={(e) => {
                      const newYearFrom = e.target.value;
                      setGlobalFilters({
                        ...globalFilters, 
                        yearFrom: newYearFrom,
                        yearTo: globalFilters.yearTo && newYearFrom && parseInt(globalFilters.yearTo) < parseInt(newYearFrom) ? '' : globalFilters.yearTo
                      });
                    }}
                  >
                    <option value="">Todos</option>
                    {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Año hasta</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                    value={globalFilters.yearTo}
                    onChange={(e) => setGlobalFilters({...globalFilters, yearTo: e.target.value})}
                    disabled={!globalFilters.yearFrom}
                  >
                    <option value="">Todos</option>
                    {uniqueYears.filter(y => !globalFilters.yearFrom || parseInt(y) >= parseInt(globalFilters.yearFrom)).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Región</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                    value={globalFilters.region}
                    onChange={(e) => setGlobalFilters({...globalFilters, region: e.target.value})}
                  >
                    <option value="">Todas</option>
                    {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    className="w-full bg-slate-600 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 text-sm"
                    onClick={() => setGlobalFilters({ yearFrom: '', yearTo: '', region: '' })}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <DollarSign size={24} />
                  <span className="text-xs opacity-90">Ticket Promedio</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(kpis.avgTicket)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <ShoppingCart size={24} />
                  <span className="text-xs opacity-90">Total Ventas</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(kpis.totalAmount)}</p>
                <p className="text-xs opacity-90 mt-0.5">Cantidad de ventas: {kpis.totalSales}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <AlertTriangle size={24} />
                  <span className="text-xs opacity-90">Canceladas</span>
                </div>
                <p className="text-2xl font-bold">{kpis.canceladas}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <Package size={24} />
                  <span className="text-xs opacity-90">Problemas</span>
                </div>
                <p className="text-2xl font-bold">{kpis.problematicas}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-1">
                  <MapPin size={24} />
                  <span className="text-xs opacity-90">Cobertura</span>
                </div>
                <p className="text-xl font-bold">{kpis.regionesCount} regiones</p>
                <p className="text-xs opacity-90">{kpis.comunasCount} comunas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-slate-800">Ventas por Mes</h3>
                  <div className="flex gap-2 text-xs">
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={salesByMonthFilters.yearFrom}
                      onChange={(e) => {
                        const newYearFrom = e.target.value;
                        setSalesByMonthFilters({
                          ...salesByMonthFilters, 
                          yearFrom: newYearFrom,
                          yearTo: salesByMonthFilters.yearTo && newYearFrom && parseInt(salesByMonthFilters.yearTo) < parseInt(newYearFrom) ? '' : salesByMonthFilters.yearTo
                        });
                      }}
                    >
                      <option value="">Año desde</option>
                      {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={salesByMonthFilters.yearTo}
                      onChange={(e) => setSalesByMonthFilters({...salesByMonthFilters, yearTo: e.target.value})}
                      disabled={!salesByMonthFilters.yearFrom}
                    >
                      <option value="">Año hasta</option>
                      {uniqueYears.filter(y => !salesByMonthFilters.yearFrom || parseInt(y) >= parseInt(salesByMonthFilters.yearFrom)).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={salesByMonthFilters.monthFrom}
                      onChange={(e) => {
                        const newMonthFrom = e.target.value;
                        setSalesByMonthFilters({
                          ...salesByMonthFilters, 
                          monthFrom: newMonthFrom,
                          monthTo: salesByMonthFilters.monthTo && newMonthFrom && parseInt(salesByMonthFilters.monthTo) < parseInt(newMonthFrom) ? '' : salesByMonthFilters.monthTo
                        });
                      }}
                    >
                      <option value="">Mes desde</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={salesByMonthFilters.monthTo}
                      onChange={(e) => setSalesByMonthFilters({...salesByMonthFilters, monthTo: e.target.value})}
                      disabled={!salesByMonthFilters.monthFrom}
                    >
                      <option value="">Mes hasta</option>
                      {months.filter(m => !salesByMonthFilters.monthFrom || parseInt(m.value) >= parseInt(salesByMonthFilters.monthFrom)).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{fontSize: 11}} />
                    <YAxis yAxisId="left" tick={{fontSize: 11}} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 11}} />
                    <Tooltip formatter={(value) => typeof value === 'number' && value > 1000 ? formatCurrency(value) : value} />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Line yAxisId="left" type="monotone" dataKey="cantidad" stroke="#3b82f6" name="Cantidad" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="monto" stroke="#10b981" name="Monto (CLP)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Distribución de Estados</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie 
                          data={statusDistribution} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={85} 
                          label={(entry) => {
                            const total = statusDistribution.reduce((sum, item) => sum + item.value, 0);
                            const percent = ((entry.value / total) * 100).toFixed(1);
                            return `${entry.value} (${percent}%)`;
                          }}
                          labelStyle={{fontSize: '10px', fontWeight: 'bold'}}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => {
                            const total = statusDistribution.reduce((sum, item) => sum + item.value, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return [`${value} (${percent}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-48 flex flex-col justify-center gap-2">
                    {statusDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{backgroundColor: COLORS[index % COLORS.length]}}
                        />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-slate-600">
                            {item.value} ventas ({((item.value / statusDistribution.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-slate-800">Top 10 Productos Más Vendidos</h3>
                  <div className="flex gap-2 text-xs">
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={topProductsFilters.yearFrom}
                      onChange={(e) => {
                        const newYearFrom = e.target.value;
                        setTopProductsFilters({
                          ...topProductsFilters, 
                          yearFrom: newYearFrom,
                          yearTo: topProductsFilters.yearTo && newYearFrom && parseInt(topProductsFilters.yearTo) < parseInt(newYearFrom) ? '' : topProductsFilters.yearTo
                        });
                      }}
                    >
                      <option value="">Año desde</option>
                      {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={topProductsFilters.yearTo}
                      onChange={(e) => setTopProductsFilters({...topProductsFilters, yearTo: e.target.value})}
                      disabled={!topProductsFilters.yearFrom}
                    >
                      <option value="">Año hasta</option>
                      {uniqueYears.filter(y => !topProductsFilters.yearFrom || parseInt(y) >= parseInt(topProductsFilters.yearFrom)).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={topProductsFilters.monthFrom}
                      onChange={(e) => {
                        const newMonthFrom = e.target.value;
                        setTopProductsFilters({
                          ...topProductsFilters, 
                          monthFrom: newMonthFrom,
                          monthTo: topProductsFilters.monthTo && newMonthFrom && parseInt(topProductsFilters.monthTo) < parseInt(newMonthFrom) ? '' : topProductsFilters.monthTo
                        });
                      }}
                    >
                      <option value="">Mes desde</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select 
                      className="border border-slate-300 rounded px-2 py-1"
                      value={topProductsFilters.monthTo}
                      onChange={(e) => setTopProductsFilters({...topProductsFilters, monthTo: e.target.value})}
                      disabled={!topProductsFilters.monthFrom}
                    >
                      <option value="">Mes hasta</option>
                      {months.filter(m => !topProductsFilters.monthFrom || parseInt(m.value) >= parseInt(topProductsFilters.monthFrom)).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{fontSize: 10}} />
                    <YAxis dataKey="title" type="category" width={140} tick={{fontSize: 10}} />
                    <Tooltip 
                      content={({active, payload}) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border border-slate-300 rounded shadow-lg text-xs">
                              <p className="font-semibold">{data.fullTitle || data.title}</p>
                              <p className="text-slate-600">SKU: {data.sku}</p>
                              <p className="text-blue-600">Unidades: {data.cantidad}</p>
                              <p className="text-green-600">Monto: {formatCurrency(data.monto)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="monto" fill="#3b82f6" name="Monto (CLP)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Clientes por Región (Top 10)</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={clientsByRegion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{fontSize: 10}} />
                    <YAxis dataKey="region" type="category" width={130} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="clientes" fill="#10b981" name="Clientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;