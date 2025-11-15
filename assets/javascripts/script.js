class RansackPredicatesApp {
  constructor() {
    this.predicates = [];
    this.filteredPredicates = [];
    this.currentView = "cards"; // cards, list
    this.selectedCategories = new Set(); // selected categories for toggle behavior
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadPredicates();
    this.updateDropdownText();
    this.render();
  }

  bindEvents() {
    const searchInput = document.getElementById("search");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const viewButtons = document.querySelectorAll(".view-btn");
    const dropdownToggle = document.getElementById("dropdown-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const dropdownCheckboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]',
    );

    searchInput.addEventListener(
      "input",
      this.debounce(() => this.filterPredicates(), 300),
    );

    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setCategoryFilter(
          e.target.closest(".category-btn").dataset.category,
        );
      });
    });

    // Dropdown functionality
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener("click", () => {
        dropdownMenu.classList.toggle("show");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".category-dropdown")) {
          dropdownMenu.classList.remove("show");
        }
      });

      // Handle checkbox changes
      dropdownCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          this.setCategoryFilter(e.target.dataset.category);
        });
      });
    }

    themeToggle.addEventListener("click", () => this.toggleTheme());

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setView(e.target.closest(".view-btn").dataset.view);
      });
    });

    // Initialize theme
    this.initTheme();
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async loadPredicates() {
    try {
      this.showLoading();
      // Use the predicates data directly
      this.predicates = this.getPredicatesData();
      this.filteredPredicates = [...this.predicates];

      this.updateLastUpdated(new Date().toISOString());
      this.hideLoading();
    } catch (error) {
      this.showError(error.message);
    }
  }

  getPredicatesData() {
    return [
      // Equality predicates
      {
        name: "eq",
        category: "Equality",
        description: "Equals (exact match)",
        syntax: "attribute_eq",
        example: `User.ransack(name_eq: 'John')
# SQL: WHERE "users"."name" = 'John'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "eq_any",
        category: "Equality",
        description: "Equals any of the provided values",
        syntax: "attribute_eq_any",
        example: `User.ransack(name_eq_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" = 'John' OR "users"."name" = 'Jane')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "eq_all",
        category: "Equality",
        description: "Equals all of the provided values",
        syntax: "attribute_eq_all",
        example: `User.ransack(name_eq_all: ['John', 'Jane'])
# SQL: WHERE ("users"."name" = 'John' AND "users"."name" = 'Jane')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_eq",
        category: "Equality",
        description: "Not equal to",
        syntax: "attribute_not_eq",
        example: `User.ransack(name_not_eq: 'John')
# SQL: WHERE "users"."name" != 'John'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_eq_any",
        category: "Equality",
        description: "Not equal to any of the provided values",
        syntax: "attribute_not_eq_any",
        example: `User.ransack(name_not_eq_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" != 'John' OR "users"."name" != 'Jane')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_eq_all",
        category: "Equality",
        description: "Not equal to all of the provided values",
        syntax: "attribute_not_eq_all",
        example: `User.ransack(name_not_eq_all: ['John', 'Jane'])
# SQL: WHERE ("users"."name" != 'John' AND "users"."name" != 'Jane')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },

      // Comparison predicates
      {
        name: "lt",
        category: "Comparison",
        description: "Less than",
        syntax: "attribute_lt",
        example: `User.ransack(age_lt: 30)
# SQL: WHERE "users"."age" < 30`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "lt_any",
        category: "Comparison",
        description: "Less than any of the provided values",
        syntax: "attribute_lt_any",
        example: `User.ransack(age_lt_any: [25, 30])
# SQL: WHERE ("users"."age" < 25 OR "users"."age" < 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "lt_all",
        category: "Comparison",
        description: "Less than all of the provided values",
        syntax: "attribute_lt_all",
        example: `User.ransack(age_lt_all: [25, 30])
# SQL: WHERE ("users"."age" < 25 AND "users"."age" < 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "lteq",
        category: "Comparison",
        description: "Less than or equal to",
        syntax: "attribute_lteq",
        example: `User.ransack(age_lteq: 30)
# SQL: WHERE "users"."age" <= 30`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "lteq_any",
        category: "Comparison",
        description: "Less than or equal to any of the provided values",
        syntax: "attribute_lteq_any",
        example: `User.ransack(age_lteq_any: [25, 30])
# SQL: WHERE ("users"."age" <= 25 OR "users"."age" <= 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "lteq_all",
        category: "Comparison",
        description: "Less than or equal to all of the provided values",
        syntax: "attribute_lteq_all",
        example: `User.ransack(age_lteq_all: [25, 30])
# SQL: WHERE ("users"."age" <= 25 AND "users"."age" <= 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gt",
        category: "Comparison",
        description: "Greater than",
        syntax: "attribute_gt",
        example: `User.ransack(age_gt: 30)
# SQL: WHERE "users"."age" > 30`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gt_any",
        category: "Comparison",
        description: "Greater than any of the provided values",
        syntax: "attribute_gt_any",
        example: `User.ransack(age_gt_any: [25, 30])
# SQL: WHERE ("users"."age" > 25 OR "users"."age" > 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gt_all",
        category: "Comparison",
        description: "Greater than all of the provided values",
        syntax: "attribute_gt_all",
        example: `User.ransack(age_gt_all: [25, 30])
# SQL: WHERE ("users"."age" > 25 AND "users"."age" > 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gteq",
        category: "Comparison",
        description: "Greater than or equal to",
        syntax: "attribute_gteq",
        example: `User.ransack(age_gteq: 30)
# SQL: WHERE "users"."age" >= 30`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gteq_any",
        category: "Comparison",
        description: "Greater than or equal to any of the provided values",
        syntax: "attribute_gteq_any",
        example: `User.ransack(age_gteq_any: [25, 30])
# SQL: WHERE ("users"."age" >= 25 OR "users"."age" >= 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "gteq_all",
        category: "Comparison",
        description: "Greater than or equal to all of the provided values",
        syntax: "attribute_gteq_all",
        example: `User.ransack(age_gteq_all: [25, 30])
# SQL: WHERE ("users"."age" >= 25 AND "users"."age" >= 30)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },

      // Pattern matching predicates
      {
        name: "matches",
        category: "Pattern",
        description: "Matches with LIKE",
        syntax: "attribute_matches",
        example: `User.ransack(email_matches: '%@gmail.com')
# SQL: WHERE "users"."email" LIKE '%@gmail.com'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "matches_any",
        category: "Pattern",
        description: "Matches any of the provided patterns",
        syntax: "attribute_matches_any",
        example: `User.ransack(email_matches_any: ['%@gmail.com', '%@yahoo.com'])
# SQL: WHERE ("users"."email" LIKE '%@gmail.com' OR "users"."email" LIKE '%@yahoo.com')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "matches_all",
        category: "Pattern",
        description: "Matches all of the provided patterns",
        syntax: "attribute_matches_all",
        example: `User.ransack(email_matches_all: ['%@gmail.com', 'john%'])
# SQL: WHERE ("users"."email" LIKE '%@gmail.com' AND "users"."email" LIKE 'john%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "does_not_match",
        category: "Pattern",
        description: "Does not match with LIKE",
        syntax: "attribute_does_not_match",
        example: `User.ransack(email_does_not_match: '%@gmail.com')
# SQL: WHERE "users"."email" NOT LIKE '%@gmail.com'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "does_not_match_any",
        category: "Pattern",
        description: "Does not match any of the provided patterns",
        syntax: "attribute_does_not_match_any",
        example: `User.ransack(email_does_not_match_any: ['%@gmail.com', '%@yahoo.com'])
# SQL: WHERE ("users"."email" NOT LIKE '%@gmail.com' OR "users"."email" NOT LIKE '%@yahoo.com')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "does_not_match_all",
        category: "Pattern",
        description: "Does not match all of the provided patterns",
        syntax: "attribute_does_not_match_all",
        example: `User.ransack(email_does_not_match_all: ['%@gmail.com', 'john%'])
# SQL: WHERE ("users"."email" NOT LIKE '%@gmail.com' AND "users"."email" NOT LIKE 'john%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "cont",
        category: "Pattern",
        description: "Contains value (uses LIKE)",
        syntax: "attribute_cont",
        example: `User.ransack(name_cont: 'John')
# SQL: WHERE "users"."name" LIKE '%John%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "cont_any",
        category: "Pattern",
        description: "Contains any of the provided values",
        syntax: "attribute_cont_any",
        example: `User.ransack(name_cont_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" LIKE '%John%' OR "users"."name" LIKE '%Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "cont_all",
        category: "Pattern",
        description: "Contains all of the provided values",
        syntax: "attribute_cont_all",
        example: `User.ransack(name_cont_all: ['John', 'Doe'])
# SQL: WHERE ("users"."name" LIKE '%John%' AND "users"."name" LIKE '%Doe%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_cont",
        category: "Pattern",
        description: "Does not contain value",
        syntax: "attribute_not_cont",
        example: `User.ransack(name_not_cont: 'John')
# SQL: WHERE "users"."name" NOT LIKE '%John%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_cont_any",
        category: "Pattern",
        description: "Does not contain any of the provided values",
        syntax: "attribute_not_cont_any",
        example: `User.ransack(name_not_cont_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" NOT LIKE '%John%' OR "users"."name" NOT LIKE '%Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_cont_all",
        category: "Pattern",
        description: "Does not contain all of the provided values",
        syntax: "attribute_not_cont_all",
        example: `User.ransack(name_not_cont_all: ['John', 'Doe'])
# SQL: WHERE ("users"."name" NOT LIKE '%John%' AND "users"."name" NOT LIKE '%Doe%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "i_cont",
        category: "Pattern",
        description: "Contains value with case insensitive (uses ILIKE)",
        syntax: "attribute_i_cont",
        example: `User.ransack(name_i_cont: 'john')
# PostgreSQL: WHERE LOWER("users"."name") LIKE '%john%'
# MySQL/SQLite: WHERE "users"."name" LIKE '%john%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "i_cont_any",
        category: "Pattern",
        description: "Contains any of values with case insensitive",
        syntax: "attribute_i_cont_any",
        example: `User.ransack(name_i_cont_any: ['john', 'jane'])
# PostgreSQL: WHERE (LOWER("users"."name") LIKE '%john%' OR LOWER("users"."name") LIKE '%jane%')
# MySQL/SQLite: WHERE ("users"."name" LIKE '%john%' OR "users"."name" LIKE '%jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "i_cont_all",
        category: "Pattern",
        description: "Contains all of values with case insensitive",
        syntax: "attribute_i_cont_all",
        example: `User.ransack(name_i_cont_all: ['john', 'doe'])
# PostgreSQL: WHERE (LOWER("users"."name") LIKE '%john%' AND LOWER("users"."name") LIKE '%doe%')
# MySQL/SQLite: WHERE ("users"."name" LIKE '%john%' AND "users"."name" LIKE '%doe%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_i_cont",
        category: "Pattern",
        description: "Does not contain with case insensitive",
        syntax: "attribute_not_i_cont",
        example: `User.ransack(name_not_i_cont: 'john')
# PostgreSQL: WHERE LOWER("users"."name") NOT LIKE '%john%'
# MySQL/SQLite: WHERE "users"."name" NOT LIKE '%john%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_i_cont_any",
        category: "Pattern",
        description: "Does not contain any of values with case insensitive",
        syntax: "attribute_not_i_cont_any",
        example: `User.ransack(name_not_i_cont_any: ['john', 'jane'])
# PostgreSQL: WHERE (LOWER("users"."name") NOT LIKE '%john%' OR LOWER("users"."name") NOT LIKE '%jane%')
# MySQL/SQLite: WHERE ("users"."name" NOT LIKE '%john%' OR "users"."name" NOT LIKE '%jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_i_cont_all",
        category: "Pattern",
        description: "Does not contain all of values with case insensitive",
        syntax: "attribute_not_i_cont_all",
        example: `User.ransack(name_not_i_cont_all: ['john', 'doe'])
# PostgreSQL: WHERE (LOWER("users"."name") NOT LIKE '%john%' AND LOWER("users"."name") NOT LIKE '%doe%')
# MySQL/SQLite: WHERE ("users"."name" NOT LIKE '%john%' AND "users"."name" NOT LIKE '%doe%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "start",
        category: "Pattern",
        description: "Starts with value",
        syntax: "attribute_start",
        example: `User.ransack(name_start: 'John')
# SQL: WHERE "users"."name" LIKE 'John%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "start_any",
        category: "Pattern",
        description: "Starts with any of the provided values",
        syntax: "attribute_start_any",
        example: `User.ransack(name_start_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" LIKE 'John%' OR "users"."name" LIKE 'Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "start_all",
        category: "Pattern",
        description: "Starts with all of the provided values",
        syntax: "attribute_start_all",
        example: `User.ransack(name_start_all: ['John', 'Jane'])
# SQL: WHERE ("users"."name" LIKE 'John%' AND "users"."name" LIKE 'Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_start",
        category: "Pattern",
        description: "Does not start with value",
        syntax: "attribute_not_start",
        example: `User.ransack(name_not_start: 'John')
# SQL: WHERE "users"."name" NOT LIKE 'John%'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_start_any",
        category: "Pattern",
        description: "Does not start with any of the provided values",
        syntax: "attribute_not_start_any",
        example: `User.ransack(name_not_start_any: ['John', 'Jane'])
# SQL: WHERE ("users"."name" NOT LIKE 'John%' OR "users"."name" NOT LIKE 'Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_start_all",
        category: "Pattern",
        description: "Does not start with all of the provided values",
        syntax: "attribute_not_start_all",
        example: `User.ransack(name_not_start_all: ['John', 'Jane'])
# SQL: WHERE ("users"."name" NOT LIKE 'John%' AND "users"."name" NOT LIKE 'Jane%')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "end",
        category: "Pattern",
        description: "Ends with value",
        syntax: "attribute_end",
        example: `User.ransack(name_end: 'Doe')
# SQL: WHERE "users"."name" LIKE '%Doe'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "end_any",
        category: "Pattern",
        description: "Ends with any of the provided values",
        syntax: "attribute_end_any",
        example: `User.ransack(name_end_any: ['Doe', 'Smith'])
# SQL: WHERE ("users"."name" LIKE '%Doe' OR "users"."name" LIKE '%Smith')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "end_all",
        category: "Pattern",
        description: "Ends with all of the provided values",
        syntax: "attribute_end_all",
        example: `User.ransack(name_end_all: ['Doe', 'Smith'])
# SQL: WHERE ("users"."name" LIKE '%Doe' AND "users"."name" LIKE '%Smith')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_end",
        category: "Pattern",
        description: "Does not end with value",
        syntax: "attribute_not_end",
        example: `User.ransack(name_not_end: 'Doe')
# SQL: WHERE "users"."name" NOT LIKE '%Doe'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_end_any",
        category: "Pattern",
        description: "Does not end with any of the provided values",
        syntax: "attribute_not_end_any",
        example: `User.ransack(name_not_end_any: ['Doe', 'Smith'])
# SQL: WHERE ("users"."name" NOT LIKE '%Doe' OR "users"."name" NOT LIKE '%Smith')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_end_all",
        category: "Pattern",
        description: "Does not end with all of the provided values",
        syntax: "attribute_not_end_all",
        example: `User.ransack(name_not_end_all: ['Doe', 'Smith'])
# SQL: WHERE ("users"."name" NOT LIKE '%Doe' AND "users"."name" NOT LIKE '%Smith')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },

      // Presence/Absence predicates
      {
        name: "present",
        category: "Presence",
        description:
          "Is not null and not empty (only compatible with string columns)",
        syntax: "attribute_present",
        example: `User.ransack(name_present: true)
# SQL: WHERE ("users"."name" IS NOT NULL AND "users"."name" != '')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "blank",
        category: "Presence",
        description: "Is null or empty",
        syntax: "attribute_blank",
        example: `User.ransack(name_blank: true)
# SQL: WHERE ("users"."name" IS NULL OR "users"."name" = '')`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "null",
        category: "Presence",
        description: "Is null",
        syntax: "attribute_null",
        example: `User.ransack(name_null: true)
# SQL: WHERE "users"."name" IS NULL`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_null",
        category: "Presence",
        description: "Is not null",
        syntax: "attribute_not_null",
        example: `User.ransack(name_not_null: true)
# SQL: WHERE "users"."name" IS NOT NULL`,
        url: "https://github.com/activerecord-hackery/ransack",
      },

      // Inclusion/Exclusion predicates
      {
        name: "in",
        category: "Inclusion",
        description: "Match any values in array",
        syntax: "attribute_in",
        example: `User.ransack(age_in: [25, 30, 35])
# SQL: WHERE "users"."age" IN (25, 30, 35)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "in_any",
        category: "Inclusion",
        description: "Match any values in any of the provided arrays",
        syntax: "attribute_in_any",
        example: `User.ransack(age_in_any: [[25, 30], [35, 40]])
# SQL: WHERE ("users"."age" IN (25, 30) OR "users"."age" IN (35, 40))`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "in_all",
        category: "Inclusion",
        description: "Match all values in all of the provided arrays",
        syntax: "attribute_in_all",
        example: `User.ransack(age_in_all: [[25, 30], [25, 35]])
# SQL: WHERE ("users"."age" IN (25, 30) AND "users"."age" IN (25, 35))`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_in",
        category: "Inclusion",
        description: "Match none of values in array",
        syntax: "attribute_not_in",
        example: `User.ransack(age_not_in: [25, 30, 35])
# SQL: WHERE "users"."age" NOT IN (25, 30, 35)`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_in_any",
        category: "Inclusion",
        description: "Match none of values in any of the provided arrays",
        syntax: "attribute_not_in_any",
        example: `User.ransack(age_not_in_any: [[25, 30], [35, 40]])
# SQL: WHERE ("users"."age" NOT IN (25, 30) OR "users"."age" NOT IN (35, 40))`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "not_in_all",
        category: "Inclusion",
        description: "Match none of values in all of the provided arrays",
        syntax: "attribute_not_in_all",
        example: `User.ransack(age_not_in_all: [[25, 30], [25, 35]])
# SQL: WHERE ("users"."age" NOT IN (25, 30) AND "users"."age" NOT IN (25, 35))`,
        url: "https://github.com/activerecord-hackery/ransack",
      },

      // Boolean predicates
      {
        name: "true",
        category: "Boolean",
        description: "Is true",
        syntax: "attribute_true",
        example: `User.ransack(active_true: true)
# SQL: WHERE "users"."active" = 't'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
      {
        name: "false",
        category: "Boolean",
        description: "Is false",
        syntax: "attribute_false",
        example: `User.ransack(active_false: true)
# SQL: WHERE "users"."active" = 'f'`,
        url: "https://github.com/activerecord-hackery/ransack",
      },
    ];
  }

  filterPredicates() {
    const searchTerm = document.getElementById("search").value.toLowerCase();

    this.filteredPredicates = this.predicates.filter((predicate) => {
      const matchesSearch =
        !searchTerm ||
        predicate.name.toLowerCase().includes(searchTerm) ||
        predicate.description.toLowerCase().includes(searchTerm) ||
        predicate.category.toLowerCase().includes(searchTerm) ||
        predicate.syntax.toLowerCase().includes(searchTerm);

      // Match if no categories selected or predicate's category is in selected set
      const matchesCategory =
        this.selectedCategories.size === 0 ||
        this.selectedCategories.has(predicate.category);

      return matchesSearch && matchesCategory;
    });

    this.render();
  }

  setCategoryFilter(category) {
    // Toggle individual category
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }

    // Update button states
    const button = document.querySelector(
      `.category-btn[data-category="${category}"]`,
    );
    if (button) {
      button.classList.toggle("active");
    }

    // Update checkbox states
    const checkbox = document.querySelector(
      `.dropdown-item input[data-category="${category}"]`,
    );
    if (checkbox) {
      checkbox.checked = this.selectedCategories.has(category);
    }

    // Update dropdown text
    this.updateDropdownText();

    this.filterPredicates();
  }

  updateDropdownText() {
    const dropdownText = document.getElementById("dropdown-text");
    if (!dropdownText) return;

    if (this.selectedCategories.size === 0) {
      dropdownText.textContent = "Select Categories";
    } else if (this.selectedCategories.size === 1) {
      dropdownText.textContent = Array.from(this.selectedCategories)[0];
    } else {
      dropdownText.textContent = `${this.selectedCategories.size} Categories Selected`;
    }
  }

  render() {
    this.renderPredicates();
    this.addCopyEventListeners();
    // Apply syntax highlighting after rendering
    this.applySyntaxHighlighting();
  }

  addCopyEventListeners() {
    const copyButtons = document.querySelectorAll(
      ".copy-btn, .terminal-copy-btn",
    );

    copyButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const syntax = btn.dataset.syntax;
        this.copyToClipboard(syntax, btn);
      });
    });
  }

  setView(view) {
    // Only allow cards or list views
    if (view !== "cards" && view !== "list") {
      view = "cards"; // Default to cards view if invalid view is provided
    }

    this.currentView = view;

    // Update active button
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    this.render();
  }

  renderPredicates() {
    const container = document.getElementById("predicates");

    if (this.filteredPredicates.length === 0) {
      container.innerHTML = `
                <div class="no-results">
                    <p>No predicates found matching your criteria.</p>
                </div>
            `;
      return;
    }

    switch (this.currentView) {
      case "cards":
        container.innerHTML = this.filteredPredicates
          .map((predicate) => this.createPredicateCard(predicate))
          .join("");
        container.className = "predicates-grid";
        break;
      case "list":
        container.innerHTML = this.filteredPredicates
          .map((predicate) => this.createPredicateListItem(predicate))
          .join("");
        container.className = "predicates-list";
        break;
    }
  }

  createPredicateCard(predicate) {
    const categoryClass = predicate.category.toLowerCase().replace(" ", "-");

    return `
            <div class="predicate-card ${categoryClass}" data-predicate-name="${predicate.name}">
                <div class="predicate-header">
                    <div class="predicate-name">
                        ${predicate.name}
                    </div>
                    <div class="predicate-category ${categoryClass}">${predicate.category}</div>
                </div>
                <div class="predicate-description">${predicate.description}</div>
                <div class="terminal-prompt">
                    <div class="terminal-prompt-content">
                        <span class="terminal-prompt-prefix">#</span>
                        <span class="terminal-prompt-command"><code class="language-ruby">${predicate.syntax}</code></span>
                    </div>
                    <button class="terminal-copy-btn" data-syntax="${predicate.syntax.replace("attribute_", "_")}" aria-label="Copy syntax">
                        <svg aria-hidden="true" focusable="false" class="octicon octicon-copy" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" display="inline-block" overflow="visible">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                        </svg>
                    </button>
                </div>
                <div class="predicate-example">
                    <h4>Example:</h4>
                    <pre><code class="language-ruby">${this.escapeHtml(predicate.example)}</code></pre>
                </div>
            </div>
        `;
  }

  createPredicateListItem(predicate) {
    const categoryClass = predicate.category.toLowerCase().replace(" ", "-");

    return `
            <div class="predicate-list-item ${categoryClass}">
                <div class="predicate-list-name">
                    ${predicate.name}
                </div>
                <div class="predicate-list-info">
                    <div class="predicate-list-description">${predicate.description}</div>
                    <div class="terminal-prompt">
                        <div class="terminal-prompt-content">
                            <span class="terminal-prompt-prefix">#</span>
                            <span class="terminal-prompt-command"><code class="language-ruby">${predicate.syntax}</code></span>
                        </div>
                        <button class="terminal-copy-btn" data-syntax="${predicate.syntax.replace("attribute_", "_")}" aria-label="Copy syntax">
                            <svg aria-hidden="true" focusable="false" class="octicon octicon-copy" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" display="inline-block" overflow="visible">
                                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  copyToClipboard(text, button) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Add a brief visual feedback
        if (button) {
          button.classList.add("copy-success");
        }

        setTimeout(() => {
          if (button) {
            button.classList.remove("copy-success");
          }
        }, 500);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  showLoading() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("error").style.display = "none";
    document.getElementById("predicates-container").style.display = "none";
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("predicates-container").style.display = "block";
  }

  showError(message) {
    const errorElement = document.getElementById("error");
    errorElement.textContent = message;
    errorElement.style.display = "block";
    document.getElementById("loading").style.display = "none";
    document.getElementById("predicates-container").style.display = "none";
  }

  showSuccess(message) {
    // Create a temporary success message
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--green);
            color: var(--bg);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 90vw;
            word-wrap: break-word;
        `;

    document.body.appendChild(successDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  }

  updateLastUpdated(timestamp) {
    if (!timestamp) return;

    // Parse ISO-8601 UTC timestamp and display it in ISO-8601 UTC format
    const date = new Date(timestamp);
    const iso8601UTC = date.toISOString();

    document.getElementById("footer-updated").textContent = iso8601UTC;
  }

  initTheme() {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    this.setTheme(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.body.classList.contains("light-theme")
      ? "light"
      : "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");

    if (theme === "light") {
      body.classList.add("light-theme");
      themeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
      themeIcon.classList.remove("sun");
      themeIcon.classList.add("moon");
    } else {
      body.classList.remove("light-theme");
      themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
      themeIcon.classList.remove("moon");
      themeIcon.classList.add("sun");
    }

    // Save theme preference
    localStorage.setItem("theme", theme);
  }

  applySyntaxHighlighting() {
    // Apply Prism highlighting to all code blocks
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Add CSS dynamically
const style = document.createElement("style");
style.textContent = `
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem 1rem;
        color: var(--comment);
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new RansackPredicatesApp();
});
