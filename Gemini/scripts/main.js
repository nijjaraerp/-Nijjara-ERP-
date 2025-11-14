document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const orbitalSystem = document.getElementById('orbital-system');
    const planets = document.querySelectorAll('.planet');
    const moduleView = document.getElementById('module-view');
    const moduleContent = document.getElementById('module-content');
    const exitModuleViewBtn = document.getElementById('exit-module-view');

    // --- Expanded Mock Data ---
    const moduleData = {
        sys: {
            title: 'إدارة النظام',
            description: 'إدارة المستخدمين، الصلاحيات، والإعدادات العامة للنظام.',
            subModules: [
                { 
                    id: 'users_table', 
                    name: 'عرض المستخدمين', 
                    type: 'table',
                    headers: ['اسم المستخدم', 'الدور', 'آخر دخول', 'الحالة'],
                    rows: [
                        ['mkhoraiby', 'مدير النظام', '2025-11-14 08:30', '<span class="status-active">نشط</span>'],
                        ['user1', 'محاسب', '2025-11-14 08:25', '<span class="status-active">نشط</span>'],
                        ['user2', 'مدير مشروع', '2025-11-13 12:00', '<span class="status-inactive">غير نشط</span>']
                    ]
                },
                { 
                    id: 'add_user', 
                    name: 'إضافة مستخدم', 
                    type: 'form',
                    fields: [
                        { label: 'اسم المستخدم', type: 'text', id: 'new_username' },
                        { label: 'كلمة المرور', type: 'password', id: 'new_password' },
                        { label: 'الدور', type: 'select', id: 'new_role', options: ['محاسب', 'مدير مشروع', 'موظف موارد بشرية'] },
                        { label: 'ملاحظات', type: 'textarea', id: 'new_user_notes' }
                    ]
                }
            ]
        },
        hrm: {
            title: 'الموارد البشرية',
            description: 'إدارة شاملة للموظفين من سجلاتهم الشخصية إلى الحضور والرواتب.',
            subModules: [
                {
                    id: 'employees_table',
                    name: 'سجل الموظفين',
                    type: 'table',
                    headers: ['الاسم', 'القسم', 'تاريخ التعيين', 'الراتب'],
                    rows: [
                        ['أحمد محمود', 'الهندسة', '2023-05-10', '12,000'],
                        ['فاطمة علي', 'المحاسبة', '2022-09-01', '10,500']
                    ]
                },
                {
                    id: 'add_employee',
                    name: 'إضافة موظف',
                    type: 'form',
                    fields: [
                        { label: 'اسم الموظف الكامل', type: 'text', id: 'emp_name' },
                        { label: 'الرقم الوظيفي', type: 'text', id: 'emp_id' },
                        { label: 'القسم', type: 'text', id: 'emp_dept' },
                        { label: 'تاريخ التعيين', type: 'date', id: 'emp_hire_date' },
                        { label: 'الراتب الأساسي', type: 'number', id: 'emp_salary' }
                    ]
                }
            ]
        },
        prj: {
            title: 'إدارة المشاريع',
            description: 'تخطيط وتنفيذ ومراقبة المشاريع.',
            subModules: [
                {
                    id: 'projects_table',
                    name: 'عرض المشاريع',
                    type: 'table',
                    headers: ['اسم المشروع', 'العميل', 'الحالة', 'الميزانية'],
                     rows: [
                        ['بناء برج الرياض', 'شركة أصول', '<span class="status-active">قيد التنفيذ</span>', '5,000,000'],
                        ['تطوير نظام مالي', 'بنك الاستثمار', '<span class="status-done">مكتمل</span>', '1,200,000']
                    ]
                }
            ]
        },
        fin: {
            title: 'الشؤون المالية',
            description: 'تسجيل وتتبع جميع المعاملات المالية.',
            subModules: [
                 {
                    id: 'expenses_table',
                    name: 'جدول المصاريف',
                    type: 'table',
                    headers: ['البند', 'المبلغ', 'التاريخ', 'المشروع'],
                    rows: [
                        ['شراء أسمنت', '15,000', '2025-11-12', 'بناء برج الرياض'],
                        ['أجور عمال', '25,000', '2025-11-10', 'بناء برج الرياض']
                    ]
                }
            ]
        }
    };

    // --- UI Generation Functions ---

    function generateTabs(subModules) {
        return `
            <nav class="holographic-tabs">
                ${subModules.map((sm, index) => `
                    <button class="tab-item ${index === 0 ? 'active' : ''}" data-target="${sm.id}">
                        ${sm.name}
                    </button>
                `).join('')}
            </nav>
        `;
    }

    function generateTable(data) {
        const tableActions = `<div class="table-actions"><button class="neon-button-small">تعديل</button><button class="neon-button-small danger">حذف</button></div>`;
        return `
            <div class="table-container">
                <table class="holographic-table">
                    <thead>
                        <tr>
                            ${data.headers.map(h => `<th>${h}</th>`).join('')}
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                                <td>${tableActions}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function generateForm(data) {
        return `
            <form class="holographic-form">
                ${data.fields.map(field => `
                    <div class="form-group">
                        ${field.type === 'textarea' 
                            ? `<textarea id="${field.id}" required></textarea>`
                            : field.type === 'select'
                            ? `<select id="${field.id}">${field.options.map(o => `<option>${o}</option>`).join('')}</select>`
                            : `<input type="${field.type}" id="${field.id}" required>`
                        }
                        <label for="${field.id}">${field.label}</label>
                    </div>
                `).join('')}
                <div class="form-actions">
                    <button type="submit" class="neon-button">حفظ البيانات</button>
                </div>
            </form>
        `;
    }

    function generateContentPanes(subModules) {
        return subModules.map((sm, index) => {
            let content = '';
            if (sm.type === 'table') {
                content = generateTable(sm);
            } else if (sm.type === 'form') {
                content = generateForm(sm);
            } else {
                content = `<p>${sm.description || ''}</p>`;
            }
            return `<div class="tab-pane ${index === 0 ? 'active' : ''}" id="${sm.id}">${content}</div>`;
        }).join('');
    }

    // --- Core Functions ---

    function switchScreen(screenIdToShow) {
        document.querySelectorAll('.ui-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenIdToShow)?.classList.add('active');
    }

    function showModuleView(moduleKey) {
        const data = moduleData[moduleKey];
        if (!data) return;

        const tabsHtml = generateTabs(data.subModules);
        const panesHtml = generateContentPanes(data.subModules);

        moduleContent.innerHTML = `
            <div class="module-header">
                <h2 class="neon-text-primary">${data.title}</h2>
                <p>${data.description}</p>
            </div>
            ${tabsHtml}
            <div class="tab-content">
                ${panesHtml}
            </div>
        `;

        orbitalSystem.classList.add('zoomed');
        moduleView.classList.add('visible');
        
        // Add event listeners for the new tabs
        moduleView.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate old tab and pane
                moduleView.querySelector('.tab-item.active').classList.remove('active');
                moduleView.querySelector('.tab-pane.active').classList.remove('active');
                
                // Activate new tab and pane
                tab.classList.add('active');
                moduleView.querySelector(`#${tab.dataset.target}`).classList.add('active');
            });
        });
    }

    function hideModuleView() {
        orbitalSystem.classList.remove('zoomed');
        moduleView.classList.remove('visible');
    }

    // --- Event Listeners ---

    loginBtn.addEventListener('click', () => {
        const stars = document.getElementById('cosmic-background');
        stars.style.transition = 'transform 1s ease-in-out';
        stars.style.transform = 'scale(2) translateZ(-500px)';
        setTimeout(() => {
            switchScreen('dashboard-screen');
            stars.style.transform = 'scale(1) translateZ(0)';
        }, 1000);
    });
    
    logoutBtn.addEventListener('click', () => {
        hideModuleView();
        setTimeout(() => switchScreen('login-screen'), 500);
    });

    planets.forEach(planet => {
        planet.addEventListener('click', () => showModuleView(planet.dataset.module));
    });

    exitModuleViewBtn.addEventListener('click', hideModuleView);
});
