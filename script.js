document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const categoryGrid = document.getElementById('categoryGrid');
    const selectedCategoryName = document.getElementById('selectedCategoryName');
    let businessData = null;
    let selectedCategory = null;

    // Fetch business data
    async function fetchBusinessData() {
        try {
            const response = await fetch('./businesses.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            businessData = await response.json();

            renderCategoryGrid(businessData.categories);
            renderBusinesses(businessData.businesses);
        } catch (error) {
            console.error('Error fetching business data:', error);
            businessList.innerHTML = `
                <div class="no-results">
                    <p>डेटा लोड करण्यात त्रुटी आली: ${error.message}</p>
                </div>`;
        }
    }

    // Render category grid
    function renderCategoryGrid(categories) {
        categoryGrid.innerHTML = '';
        
        // Create "All Categories" item first
        const allCategoriesItem = createAllCategoriesItem();
        categoryGrid.appendChild(allCategoriesItem);

        // Then add other categories
        categories.forEach(category => {
            const categoryItem = createCategoryItem(category);
            categoryGrid.appendChild(categoryItem);
        });
    }

    // Create category item
    function createCategoryItem(category) {
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        `;

        categoryItem.addEventListener('click', () => {
            selectCategory(categoryItem, category);
        });

        return categoryItem;
    }

    // Create "All Categories" item
    function createAllCategoriesItem() {
        const allCategoriesItem = document.createElement('div');
        allCategoriesItem.classList.add('category-item');
        allCategoriesItem.innerHTML = `
            <i class="fas fa-th-large"></i>
            <span>सर्व श्रेण्या</span>
        `;

        allCategoriesItem.addEventListener('click', () => {
            selectAllCategories(allCategoriesItem);
        });

        return allCategoriesItem;
    }

    // Select category
    function selectCategory(categoryItem, category) {
        document.querySelectorAll('.category-item').forEach(item =>
            item.classList.remove('selected')
        );
        categoryItem.classList.add('selected');
        selectedCategory = category.id;
        
        // Remove the extra category name display
        selectedCategoryName.textContent = '';
        selectedCategoryName.style.opacity = '0';
        
        filterBusinesses();
    }

    // Select all categories
    function selectAllCategories(allCategoriesItem) {
        document.querySelectorAll('.category-item').forEach(item =>
            item.classList.remove('selected')
        );
        allCategoriesItem.classList.add('selected');
        selectedCategory = null;
        selectedCategoryName.textContent = '';
        selectedCategoryName.style.opacity = '0';
        filterBusinesses();
    }

    // Filter and render businesses
    function filterBusinesses() {
        const searchTerm = searchInput.value.trim();
        const filteredBusinesses = businessData.businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm ||
                Object.values(business).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            return matchesCategory && matchesSearch;
        });
        renderBusinesses(filteredBusinesses);
    }

    // Render businesses
    function renderBusinesses(businesses) {
        businessList.innerHTML = '';

        if (businesses.length === 0) {
            businessList.innerHTML = '<div class="no-results"><p>कोणतेही व्यवसाय सापडले नाहीत.</p></div>';
            return;
        }

        const groupedBusinesses = businesses.reduce((acc, business) => {
            if (!acc[business.category]) acc[business.category] = [];
            acc[business.category].push(business);
            return acc;
        }, {});

        for (const categoryId in groupedBusinesses) {
            const category = businessData.categories.find(cat => cat.id === categoryId);
            const categoryHeader = createCategoryHeader(category);
            businessList.appendChild(categoryHeader);

            groupedBusinesses[categoryId].forEach(business => {
                const businessCard = createBusinessCard(business);
                businessList.appendChild(businessCard);
            });
        }
    }

    // Create category header
    function createCategoryHeader(category) {
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
        return categoryHeader;
    }

    // Create business card
    function createBusinessCard(business) {
        const businessCard = document.createElement('div');
        businessCard.classList.add('business-card');
        businessCard.innerHTML = `
            <h4>${business.shopName}</h4>
            <p><strong>मालक:</strong> ${business.ownerName}</p>
            <p><strong>संपर्क:</strong> <a href="tel:${business.contactNumber}">${formatPhoneNumber(business.contactNumber)}</a></p>
        `;
        return businessCard;
    }

    // Format phone number for better readability
    function formatPhoneNumber(phoneNumber) {
        if (phoneNumber.length === 10) {
            return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
        }
        return phoneNumber;
    }

    // Handle search input
    searchInput.addEventListener('input', filterBusinesses);

    // Initialize app
    fetchBusinessData();
});


document.addEventListener('DOMContentLoaded', () => {
    // ... (keep existing code)

    // Modify createAllCategoriesItem function
    function createAllCategoriesItem() {
        const allCategoriesItem = document.createElement('div');
        allCategoriesItem.classList.add('category-item', 'all-categories-dropdown');
        allCategoriesItem.innerHTML = `
            <i class="fas fa-th-large"></i>
            <span>सर्व श्रेण्या</span>
            <i class="fas fa-chevron-down dropdown-icon"></i>
        `;

        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');
        dropdownMenu.style.display = 'none';

        // Populate dropdown with all categories
        businessData.categories.forEach(category => {
            const dropdownItem = document.createElement('div');
            dropdownItem.classList.add('dropdown-item');
            dropdownItem.innerHTML = `
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            `;

            dropdownItem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent event from bubbling
                selectCategory(allCategoriesItem, category);
                dropdownMenu.style.display = 'none';
            });

            dropdownMenu.appendChild(dropdownItem);
        });

        allCategoriesItem.appendChild(dropdownMenu);

        // Toggle dropdown on click
        allCategoriesItem.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click from immediately closing
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });

        return allCategoriesItem;
    }

    // Add CSS for dropdown in script (you can move this to your CSS file)
    const style = document.createElement('style');
    style.textContent = `
        .all-categories-dropdown {
            position: relative;
        }
        .dropdown-icon {
            margin-left: 10px;
            transition: transform 0.3s ease;
        }
        .all-categories-dropdown.active .dropdown-icon {
            transform: rotate(180deg);
        }
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10;
            margin-top: 10px;
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            padding: 10px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .dropdown-item:hover {
            background-color: #f0f0f0;
        }
        .dropdown-item i {
            margin-right: 10px;
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);

    // Rest of the existing code remains the same
});
