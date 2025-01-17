import React, { useEffect, useState } from "react";
import { Card, Checkbox, Button, message } from "antd";
import { supabase } from "api/supabaseClient";
import { useSelector } from "react-redux";

const Interests = () => {
    const [categories, setCategories] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState({});
    const { session } = useSelector((state) => state.auth);
    const userId = session?.user?.id;

    // Fetch categories from ib_categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("ib_categories")
                .select("id, category_name, parent_category_id").order('category_name', { scending: true });

            if (error) {
                message.error("Failed to fetch categories");
                return;
            }

            // Organize categories into parent-child structure
            const categoryMap = {};
            data.forEach((cat) => {
                if (!cat.parent_category_id) {
                    categoryMap[cat.id] = { ...cat, children: [] };
                }
            });
            data.forEach((cat) => {
                if (cat.parent_category_id && categoryMap[cat.parent_category_id]) {
                    categoryMap[cat.parent_category_id].children.push(cat);
                }
            });

            setCategories(Object.values(categoryMap));
        };

        fetchCategories();
    }, []);

    // Fetch user's saved interests
    useEffect(() => {
        const fetchUserInterests = async () => {
            const { data, error } = await supabase
                .from("ib_members")
                .select("networking")
                .eq("user_id", userId)
                .single();

            if (error) {
                message.error("Failed to fetch user interests");
                return;
            }

            setSelectedInterests(data?.networking || {});
        };

        if (userId) {
            fetchUserInterests();
        }
    }, [userId]);

    // Handle checkbox selection
    const handleCheckboxChange = (checkedValues, parentId) => {
        setSelectedInterests((prev) => ({
            ...prev,
            [parentId]: checkedValues, // Store child IDs under their parent ID
        }));
    };

    // Save selected interests in nested format
    const handleSubmit = async () => {
        const { error } = await supabase
            .from("ib_members")
            .update({ networking: selectedInterests }) // Save as a structured object
            .eq("user_id", userId);

        if (error) {
            message.error("Failed to save interests");
        } else {
            message.success("Interests saved successfully!");
        }
    };

    return (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {categories.map((parent) => (
                <Card key={parent.id} title={parent.category_name} style={{ width: 300 }}>
                    <Checkbox.Group
                        value={selectedInterests[parent.id] || []}
                        onChange={(checkedValues) => handleCheckboxChange(checkedValues, parent.id)}
                    >
                        {parent.children.map((child) => (
                            <div key={child.id}>
                                <Checkbox value={child.id}>{child.category_name}</Checkbox>
                            </div>
                        ))}
                    </Checkbox.Group>
                </Card>
            ))}
            <div style={{ width: "100%", marginTop: 16 }}>
                <Button type="primary" onClick={handleSubmit}>Save Interests</Button>
            </div>
        </div>
    );
};

export default Interests;
