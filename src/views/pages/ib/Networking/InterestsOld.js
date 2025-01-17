import React, { useState, useEffect } from "react";
import { Select, Checkbox, Button, message } from "antd";
import { supabase } from "api/supabaseClient";
import { useSelector } from "react-redux";

const { Option } = Select;


const Interests = ({ userId }) => {
    const [categories, setCategories] = useState([]);
    const [level1Categories, setLevel1Categories] = useState([]);
    const [selectedLevel1, setSelectedLevel1] = useState(null);
    const [level2Categories, setLevel2Categories] = useState([]);
    const [selectedLevel2, setSelectedLevel2] = useState([]);

    const { session } = useSelector((state) => state.auth);

    // Fetch categories and build tree
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("ib_categories")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                message.error("Failed to fetch categories");
                console.error(error);
            } else {
                setCategories(data);
                const level1 = data.filter((category) => category.parent_category_id === null);
                setLevel1Categories(level1);
            }
        };

        fetchCategories();
    }, []);

    // Update level 2 categories based on level 1 selection
    useEffect(() => {
        if (selectedLevel1) {
            const level2 = categories.filter((category) => category.parent_category_id === selectedLevel1);
            setLevel2Categories(level2);
        } else {
            setLevel2Categories([]);
        }
    }, [selectedLevel1, categories]);

    const handleSubmit = async () => {
        console.log(selectedLevel2)
        // try {
        //     const { error } = await supabase
        //         .from("users")
        //         .update({ networking: selectedLevel2 })
        //         .eq("id", session?.user?.id);

        //     if (error) throw error;
        //     message.success("Updated successfully!");
        // } catch (err) {
        //     message.error("Failed to update!");
        //     console.error(err);
        // }
    };

    return (
        <div>
            <h3>Select Level 1 Category</h3>
            <Select
                placeholder="Select a Level 1 Category"
                style={{ width: "100%" }}
                onChange={(value) => setSelectedLevel1(value)}
                value={selectedLevel1}
            >
                {level1Categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                        {category.category_name}
                    </Option>
                ))}
            </Select>

            {level2Categories.length > 0 && (
                <>
                    <h3>Select Level 2 Categories</h3>
                    <Checkbox.Group
                        options={level2Categories.map((category) => ({
                            label: category.category_name,
                            value: category.id,
                        }))}
                        value={selectedLevel2}
                        onChange={(checkedValues) => setSelectedLevel2(checkedValues)}
                    />
                </>
            )}

            <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleSubmit}
                disabled={!selectedLevel1 || selectedLevel2.length === 0}
            >
                Submit
            </Button>
        </div>
    );
};

export default Interests;
