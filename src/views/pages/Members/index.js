import { Select } from 'antd';
import React, { useState } from 'react';
import DynamicViews from '../DynamicViews';
const { Option } = Select;

const Index = () => {
    const [nativeFilter, setNativeFilter] = useState(null);
    const [kovilFilter, setKovilFilter] = useState(null);

    const nativeOptions = [
        "A.Muthupattinam (Attangudi)", "A.Siruvayal (Aranmanai)", "A.Thekkur (Aathikkadu)", "Aavinippatti", "Alavakkottai",
        "Amaravathi Puthoor", "Arimalam", "Ariyakkudi", "Attangudi", "Chokkalingam Pudur", "Chokkanathapuram", "Devakkottai",
        "Madagu Patti", "Mahibalan Patti", "Managiri", "Melaisivapuri", "Mithilaippatti", "Nachandu Patti", "Nachiapuram",
        "Natarajapuram", "Nattarasankottai", "Nemathanpatti", "Nerkuppai", "Okkur", "P.Alagapuri (Pillamangalam)",
        "P.Pudupatti (Ponnamaravathi)", "Paganeri", "Palavangudi", "Pallathur", "Panangudi", "Panayappatti", "Pattamangalam",
        "Poolankurichi", "Puduvayal", "Rangiem", "Rayavaram", "Sakkanthy", "Sembanoor", "Sevvoor", "Shanmuganathapuram (Aaravayal)",
        "Sholapuram", "Siruvayal", "Sirukoodal Patti", "Siruvayal (Oyyakundan)", "Thanichaoorani", "Thenipatti", "Ulagampatti",
        "V.Lakshmipuram (Virachilai)", "Valayapatti", "Vegupatti", "Venthanpatti", "Vetriyur", "Virachilai", "Viramathi",
        "K.Alagapuri (Kollangudi)", "K.Alagapuri (Kottaiyur)", "K.Lakshmipuram (Kothamangalam)", "Kaanadu Kathan", "Kadiyapatti",
        "Kalayar Mangalam", "Kallal", "Kalluppatti", "Kandanoor", "Kandaramanikkam", "Kandavarayan Patti", "Karaikudi",
        "Karungulam", "Kila Poongudi", "Kilachival Patti", "Konapattu", "Koppanapatti", "Kothamangalam", "Kottaiyur",
        "Kulipirai", "Kuruvikkondan Patti"
    ];

    const kovilOptions = [
        "Iliyatrangudi", "Ilupakkudi", "Iranniyur", "Mathur", "Nemam", "Pillayarpatti", "Soorakudi", "Vairavankovil", "Velangudi"
    ];

    // Construct fetchFilters based on selected values
    const fetchFilters = [
        nativeFilter && { column: 'details.native', value: nativeFilter },
        kovilFilter && { column: 'details.kovil', value: kovilFilter },
    ].filter(Boolean);

    // Custom filter components passed as props
    const customFilters = (
        <div style={{ display: 'flex', gap: 8 }}>
            <Select
                placeholder="Select Native"
                style={{ width: 150 }}
                onChange={setNativeFilter}
                value={nativeFilter}
                allowClear showSearch
            >
                {nativeOptions?.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                ))}
            </Select>
            <Select
                placeholder="Select Kovil"
                style={{ width: 150 }}
                onChange={setKovilFilter}
                value={kovilFilter}
                allowClear showSearch
            >
                {kovilOptions?.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                ))}
            </Select>
        </div>
    );
    return (
        <DynamicViews entityType={'users'} fetchFilters={fetchFilters} customFilters={customFilters} />
    );
}

export default Index;