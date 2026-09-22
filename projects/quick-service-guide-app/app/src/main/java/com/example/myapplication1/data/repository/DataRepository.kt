package com.example.myapplication1.data.repository

import com.example.myapplication1.data.model.*
import java.util.*

/**
 * 数据存储库 - 提供应用所需的所有数据
 * 这个简化版本直接在内存中存储数据，实际应用中应该使用Room数据库
 */
object DataRepository {
    
    // 城市列表
    private val cities = mutableListOf(
        City("101010100", "北京", "北京市", true),
        City("101020100", "上海", "上海市", true),
        City("101030100", "天津", "天津市", true),
        City("101040100", "重庆", "重庆市", true),
        City("101280101", "广州", "广东省", true),
        City("101280601", "深圳", "广东省", true),
        City("101210101", "杭州", "浙江省", true),
        City("101190101", "南京", "江苏省", false),
        City("101200101", "武汉", "湖北省", false),
        City("101230101", "福州", "福建省", false)
    )
    
    // 默认选中的城市ID
    private var selectedCityId = "101010100"
    
    // 办事类别
    private val categories = mutableListOf(
        AffairCategory("cat001", "户政服务", "ic_household", "身份证、户口、居住证等", 1),
        AffairCategory("cat002", "社保医保", "ic_insurance", "社保、医保、养老金等", 2),
        AffairCategory("cat003", "车辆服务", "ic_car", "驾照、车辆上牌、年检等", 3),
        AffairCategory("cat004", "教育服务", "ic_education", "入学、转学、学历认证等", 4),
        AffairCategory("cat005", "住房服务", "ic_house", "购房、租房、不动产登记等", 5),
        AffairCategory("cat006", "其他服务", "ic_more", "更多政务服务", 6)
    )
    
    // 示例办事事项
    private val affairs = mutableListOf(
        // 北京办事事项
        Affair(
            id = "aff001",
            name = "身份证办理",
            categoryId = "cat001",
            cityId = "101010100", // 北京
            description = "居民身份证首次办理、换领、补领指南",
            estimatedTime = "约7个工作日",
            difficulty = 2,
            steps = listOf(
                AffairStep(
                    id = "step001",
                    title = "填写《居民身份证申领登记表》",
                    description = "到户籍所在地派出所领取并填写《居民身份证申领登记表》",
                    order = 1,
                    tips = "需要准确填写个人信息，可提前准备好户口本信息",
                    locationIds = listOf("loc001"),
                    materialIds = listOf("mat001", "mat002")
                ),
                AffairStep(
                    id = "step002",
                    title = "现场拍照",
                    description = "在派出所现场进行证件照拍摄",
                    order = 2,
                    tips = "着装整洁，不佩戴首饰，不化浓妆",
                    locationIds = listOf("loc001")
                ),
                AffairStep(
                    id = "step003",
                    title = "缴纳证件工本费",
                    description = "缴纳身份证工本费",
                    order = 3,
                    tips = "首次办理身份证免收工本费，丢失补办需缴纳工本费40元",
                    locationIds = listOf("loc001")
                ),
                AffairStep(
                    id = "step004",
                    title = "领取身份证",
                    description = "在约定时间内携带回执单到派出所领取身份证",
                    order = 4,
                    tips = "可通过回执单上的二维码查询制证进度",
                    locationIds = listOf("loc001"),
                    materialIds = listOf("mat003")
                )
            ),
            materials = listOf(
                AffairMaterial("mat001", "户口簿", "本人户口簿原件", true),
                AffairMaterial("mat002", "照片", "近期免冠照片（可现场拍摄）", false),
                AffairMaterial("mat003", "回执单", "办理时领取的回执单", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc001",
                    name = "朝阳区公安局东风派出所",
                    address = "北京市朝阳区东风南路8号",
                    telephone = "010-12345678",
                    workTime = "周一至周五 9:00-17:00（法定节假日除外）"
                )
            ),
            hotness = 98,
            updateTime = System.currentTimeMillis() - 86400000 // 一天前更新
        ),
        Affair(
            id = "aff002",
            name = "社保卡办理",
            categoryId = "cat002",
            cityId = "101010100", // 北京
            description = "社会保障卡首次办理、换领、补领指南",
            estimatedTime = "约15个工作日",
            difficulty = 2,
            steps = listOf(
                AffairStep(
                    id = "step001",
                    title = "提交申请",
                    description = "到社保经办机构或指定银行填写《社会保障卡申领表》",
                    order = 1,
                    tips = "也可通过\"北京通\"APP线上申请",
                    locationIds = listOf("loc001"),
                    materialIds = listOf("mat001", "mat002")
                ),
                AffairStep(
                    id = "step002",
                    title = "缴费",
                    description = "首次办理免费，补办需缴纳工本费",
                    order = 2,
                    locationIds = listOf("loc001")
                ),
                AffairStep(
                    id = "step003",
                    title = "领卡",
                    description = "在约定时间内携带有效证件到指定地点领取社保卡",
                    order = 3,
                    tips = "可通过北京市人社APP查询制卡进度",
                    locationIds = listOf("loc001"),
                    materialIds = listOf("mat003")
                )
            ),
            materials = listOf(
                AffairMaterial("mat001", "身份证", "身份证原件", true),
                AffairMaterial("mat002", "照片", "一寸彩色照片（蓝底或红底）", true),
                AffairMaterial("mat003", "回执单", "申请时领取的回执单", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc001",
                    name = "北京市朝阳区社保中心",
                    address = "北京市朝阳区朝阳门外大街18号",
                    telephone = "010-12345679",
                    workTime = "周一至周五 9:00-17:00（法定节假日除外）"
                )
            ),
            hotness = 95
        ),
        Affair(
            id = "aff003",
            name = "驾驶证办理",
            categoryId = "cat003",
            cityId = "101010100", // 北京
            description = "机动车驾驶证考试、申领指南",
            estimatedTime = "约2-3个月",
            difficulty = 4,
            hotness = 93
        ),
        Affair(
            id = "aff004",
            name = "入学登记",
            categoryId = "cat004",
            cityId = "101010100", // 北京
            description = "义务教育阶段入学登记指南",
            estimatedTime = "按教育部门通知时间",
            difficulty = 3,
            hotness = 88
        ),
        Affair(
            id = "aff005",
            name = "不动产登记",
            categoryId = "cat005",
            cityId = "101010100", // 北京
            description = "房屋不动产权证办理指南",
            estimatedTime = "约10个工作日",
            difficulty = 3,
            hotness = 90
        ),
        
        // 上海办事事项
        Affair(
            id = "aff101",
            name = "居住证办理",
            categoryId = "cat001",
            cityId = "101020100", // 上海
            description = "上海市居住证首次办理、换领、补领指南",
            estimatedTime = "约10个工作日",
            difficulty = 2,
            steps = listOf(
                AffairStep(
                    id = "step101",
                    title = "网上预约",
                    description = "登录'一网通办'APP或网站进行预约",
                    order = 1,
                    tips = "建议提前3-5天预约",
                    locationIds = listOf("loc101")
                ),
                AffairStep(
                    id = "step102",
                    title = "提交材料",
                    description = "到预约的派出所提交申请材料",
                    order = 2,
                    tips = "材料需要原件和复印件各一份",
                    locationIds = listOf("loc101"),
                    materialIds = listOf("mat101", "mat102", "mat103")
                ),
                AffairStep(
                    id = "step103",
                    title = "领取证件",
                    description = "按短信通知时间前往领取居住证",
                    order = 3,
                    locationIds = listOf("loc101")
                )
            ),
            materials = listOf(
                AffairMaterial("mat101", "身份证", "身份证原件及复印件", true),
                AffairMaterial("mat102", "住所证明", "房屋租赁合同或房产证明", true),
                AffairMaterial("mat103", "照片", "一寸彩色近照（蓝底）", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc101",
                    name = "徐汇区公安分局",
                    address = "上海市徐汇区华山路888号",
                    telephone = "021-64888888",
                    workTime = "周一至周六 9:00-17:00（法定节假日除外）"
                )
            ),
            hotness = 97,
            updateTime = System.currentTimeMillis() - 86400000 * 2 // 两天前更新
        ),
        Affair(
            id = "aff102",
            name = "结婚登记",
            categoryId = "cat001",
            cityId = "101020100", // 上海
            description = "上海市结婚登记办理指南",
            estimatedTime = "当天办结",
            difficulty = 1,
            steps = listOf(
                AffairStep(
                    id = "step201",
                    title = "网上预约",
                    description = "登录上海市民政局网站进行预约",
                    order = 1,
                    tips = "建议提前一周预约",
                    locationIds = listOf("loc102")
                ),
                AffairStep(
                    id = "step202",
                    title = "现场办理",
                    description = "双方携带有效证件前往登记处办理",
                    order = 2,
                    locationIds = listOf("loc102"),
                    materialIds = listOf("mat201", "mat202")
                ),
                AffairStep(
                    id = "step203",
                    title = "领取证书",
                    description = "当场领取结婚证",
                    order = 3,
                    locationIds = listOf("loc102")
                )
            ),
            materials = listOf(
                AffairMaterial("mat201", "身份证", "双方身份证原件", true),
                AffairMaterial("mat202", "照片", "两寸红底合照2张", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc102",
                    name = "上海市黄浦区婚姻登记处",
                    address = "上海市黄浦区人民大道999号",
                    telephone = "021-63123456",
                    workTime = "周一至周五 9:00-16:00（法定节假日除外）"
                )
            ),
            hotness = 92,
            updateTime = System.currentTimeMillis() - 86400000 * 3 // 三天前更新
        ),
        Affair(
            id = "aff103",
            name = "营业执照办理",
            categoryId = "cat006",
            cityId = "101020100", // 上海
            description = "上海市企业营业执照办理指南",
            estimatedTime = "约3-5个工作日",
            difficulty = 3,
            hotness = 91
        ),
        
        // 天津办事事项
        Affair(
            id = "aff201",
            name = "公积金提取",
            categoryId = "cat002",
            cityId = "101030100", // 天津
            description = "天津市住房公积金提取办理指南",
            estimatedTime = "约3个工作日",
            difficulty = 2,
            steps = listOf(
                AffairStep(
                    id = "step301",
                    title = "准备材料",
                    description = "准备身份证、银行卡等提取所需材料",
                    order = 1,
                    materialIds = listOf("mat301", "mat302")
                ),
                AffairStep(
                    id = "step302",
                    title = "在线申请",
                    description = "登录天津住房公积金网上服务大厅提出申请",
                    order = 2,
                    tips = "也可通过'天津公积金'微信小程序申请"
                ),
                AffairStep(
                    id = "step303",
                    title = "材料审核",
                    description = "等待工作人员审核材料",
                    order = 3
                ),
                AffairStep(
                    id = "step304",
                    title = "资金到账",
                    description = "审核通过后资金会自动转入指定银行账户",
                    order = 4,
                    tips = "一般2-3个工作日到账"
                )
            ),
            materials = listOf(
                AffairMaterial("mat301", "身份证", "本人身份证", true),
                AffairMaterial("mat302", "银行卡", "提取资金接收账户", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc201",
                    name = "天津市住房公积金管理中心",
                    address = "天津市和平区卫津路258号",
                    telephone = "022-27319666",
                    workTime = "周一至周五 9:00-17:00（法定节假日除外）"
                )
            ),
            hotness = 94,
            updateTime = System.currentTimeMillis() - 86400000 * 1 // 一天前更新
        ),
        Affair(
            id = "aff202",
            name = "机动车年检",
            categoryId = "cat003",
            cityId = "101030100", // 天津
            description = "天津市机动车年度检验办理指南",
            estimatedTime = "约半天",
            difficulty = 2,
            hotness = 90
        ),
        
        // 重庆办事事项
        Affair(
            id = "aff301",
            name = "出生证明办理",
            categoryId = "cat001",
            cityId = "101040100", // 重庆
            description = "重庆市出生医学证明办理指南",
            estimatedTime = "当天办结",
            difficulty = 1,
            steps = listOf(
                AffairStep(
                    id = "step401",
                    title = "提交申请",
                    description = "在医院分娩后，由医院负责办理出生证明",
                    order = 1,
                    locationIds = listOf("loc301"),
                    materialIds = listOf("mat401", "mat402")
                ),
                AffairStep(
                    id = "step402",
                    title = "信息核对",
                    description = "核对婴儿和父母信息",
                    order = 2,
                    locationIds = listOf("loc301")
                ),
                AffairStep(
                    id = "step403",
                    title = "领取证明",
                    description = "签字确认后领取出生医学证明",
                    order = 3,
                    locationIds = listOf("loc301")
                )
            ),
            materials = listOf(
                AffairMaterial("mat401", "身份证", "父母双方身份证原件", true),
                AffairMaterial("mat402", "结婚证", "父母结婚证原件", true)
            ),
            locations = listOf(
                AffairLocation(
                    id = "loc301",
                    name = "重庆市妇幼保健院",
                    address = "重庆市渝中区金汤街64号",
                    telephone = "023-63860083",
                    workTime = "全天（24小时）"
                )
            ),
            hotness = 89,
            updateTime = System.currentTimeMillis() - 86400000 * 4 // 四天前更新
        ),
        Affair(
            id = "aff302",
            name = "公交卡办理",
            categoryId = "cat006",
            cityId = "101040100", // 重庆
            description = "重庆市公共交通卡办理指南",
            estimatedTime = "当天办结",
            difficulty = 1,
            hotness = 85
        )
    )
    
    // 获取热门城市
    fun getHotCities(): List<City> {
        return cities.filter { it.isHot }
    }
    
    // 获取所有城市
    fun getAllCities(): List<City> {
        return cities
    }
    
    // 获取城市
    fun getCityById(id: String): City? {
        return cities.find { it.id == id }
    }
    
    // 设置选中的城市ID
    fun setSelectedCityId(id: String) {
        // 确保城市ID存在
        if (cities.any { it.id == id }) {
            selectedCityId = id
        }
    }
    
    // 获取选中的城市ID
    fun getSelectedCityId(): String {
        return selectedCityId
    }
    
    // 获取选中的城市
    fun getSelectedCity(): City {
        return cities.find { it.id == selectedCityId } ?: cities[0]
    }
    
    // 获取所有类别
    fun getAllCategories(): List<AffairCategory> {
        return categories
    }
    
    /**
     * 根据分类ID获取分类
     */
    fun getCategoryById(categoryId: String): AffairCategory? {
        return categories.find { it.id == categoryId }
    }
    
    // 获取指定城市的热门办事事项
    fun getHotAffairs(cityId: String, limit: Int = 5): List<Affair> {
        return affairs
            .filter { it.cityId == cityId }
            .sortedByDescending { it.hotness }
            .take(limit)
    }
    
    /**
     * 根据分类和城市获取办事事项
     */
    fun getAffairsByCategoryAndCity(categoryId: String, cityId: String): List<Affair> {
        return affairs.filter { it.categoryId == categoryId && it.cityId == cityId }
    }
    
    // 获取指定城市的所有事项
    fun getAffairsByCity(cityId: String): List<Affair> {
        return affairs.filter { it.cityId == cityId }
    }
    
    // 获取事项详情
    fun getAffairById(id: String): Affair? {
        return affairs.find { it.id == id }
    }
    
    // 搜索事项
    fun searchAffairs(query: String, cityId: String): List<Affair> {
        if (query.isBlank()) return emptyList()
        
        return affairs.filter { 
            it.cityId == cityId && 
            (it.name.contains(query, ignoreCase = true) || 
             it.description.contains(query, ignoreCase = true))
        }
    }
    
    // 待办事项
    private val todoItems = mutableListOf<TodoItem>()
    
    // 添加待办事项
    fun addTodoItem(affairId: String): TodoItem {
        val affair = getAffairById(affairId) ?: throw IllegalArgumentException("Invalid affair ID")
        val todoItem = TodoItem(
            id = "todo_${UUID.randomUUID()}",
            affairId = affairId,
            title = affair.name
        )
        todoItems.add(todoItem)
        return todoItem
    }
    
    // 获取所有待办事项
    fun getAllTodoItems(): List<TodoItem> {
        return todoItems
    }
    
    // 更新待办事项
    fun updateTodoItem(todoItem: TodoItem) {
        val index = todoItems.indexOfFirst { it.id == todoItem.id }
        if (index != -1) {
            todoItems[index] = todoItem
        }
    }
    
    // 删除待办事项
    fun deleteTodoItem(id: String) {
        todoItems.removeIf { it.id == id }
    }
    
    // 获取历史记录
    fun getHistory(): List<Affair> {
        // 假数据，实际应用中应保存用户浏览历史
        return affairs.shuffled().take(3)
    }
} 