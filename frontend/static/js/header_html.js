var header_html = "<style>"+
"			.head-avatar{"+
"				text-align: right;"+
"				margin-top: auto;"+
"				margin-bottom: auto;"+
"				padding-right: 15px;"+
"			}"+
"			.head-menu{"+
"				background-color: #515a6e03;"+
"				margin-top: 35px;"+
"				height: 40px;"+
"				line-height: 40px;"+
"			}"+
"			.head-menu-item{"+
"				font-size: 18px;"+
"				border: 1px solid #515a6e03;"+
"				border-bottom: none;"+
"				border-top-left-radius: 8px;"+
"				border-top-right-radius: 8px;"+
"			}"+
"			.head-menu-item:hover{"+
"				border: 1px solid #fff;"+
"				border-bottom: none;"+
"				border-top-left-radius: 8px;"+
"				border-top-right-radius: 8px;"+
"			}"+
"		</style>"+
"<div id=\"header\" class=\"nav-wrapper smoothie\" :style=\'{\"background-image\":\"url(\"+imgsHeader[indexImg]+\")\",\"padding-top\":\"0px\"}\'>"+
"			<row type=\"flex\" align=\"middle\">"+
"				<i-col span=\"5\">"+
"					<a href=\"/\" class=\"logo\">"+
"						<img src=\"/frontend/static/img/logo6.png\" height=\"70px\"/>"+
"					</a>"+
"				</i-col>"+
"				<i-col span=\"11\">"+
"					<i-menu mode=\"horizontal\" theme=\"dark\" class=\"head-menu\">"+
"						<menu-item name=\"article\" to=\"/article/list/\" class=\"head-menu-item\" style=\"padding: 0 10px;\">"+
"							<icon type=\"ios-paper\"></icon>文章笔记"+
"						</menu-item>"+
"						<menu-item name=\"series\" class=\"head-menu-item\" style=\"padding: 0 10px;\">"+
"							<icon type=\"ios-book\"></icon>系列专题"+
"						</menu-item>"+
"					</i-menu>"+
"				</i-col>"+
"				<i-col span=\"8\" class=\"head-avatar\">"+
"					<dropdown @on-click=\"dropdownClick\">"+
"						<a href=\"javascript:void(0)\">"+
"							<avatar icon=\"ios-person\" :src=\"avatar\" size=\"large\"/>"+
"							<icon type=\"ios-arrow-down\"></icon>"+
"						</a>"+
"						<dropdown-menu slot=\"list\" class=\"text-center\">"+
"							<dropdown-item name=\"login_register\">登录/注册</dropdown-item>"+
"							<dropdown-item name=\"add_article\">写文章</dropdown-item>"+
"							<dropdown-item>退出登录</dropdown-item>"+
"						</dropdown-menu>"+
"					</dropdown>"+
"				</i-col>"+
"			</row>"+
"			"+
"			<Modal v-model=\"loginModal\" width=\"500\">"+
"				<tabs value=\"name1\">"+
"					<tab-pane label=\"登录\" name=\"name1\"></tab-pane>"+
"					<tab-pane label=\"注册\" name=\"name2\">"+
"						<i-form ref=\"user\" :model=\"user\" :rules=\"ruleUser\" :label-width=\"100\">"+
"							<form-item label=\"用户名：\" prop=\"username\">"+
"								<i-input v-model=\"user.username\"></i-input>"+
"							</form-item>"+
"							<form-item label=\"密码：\" prop=\"password\">"+
"								<i-input type=\"password\" v-model=\"user.password\"></i-input>"+
"							</form-item>"+
"							<form-item label=\"确认密码：\" prop=\"password2\">"+
"								<i-input type=\"password\" v-model=\"user.password2\"></i-input>"+
"							</form-item>"+
"							<form-item label=\"头像：\" prop=\"avatar\">"+
"								<upload v-model=\"user.avatar\"	:before-upload=\"handleUpload\"	action=\"\">"+
"									<avatar icon=\"ios-person\" size=\"100\" shape=\"square\" style=\"cursor: pointer;\" :src=\"avatarURL\"/>"+
"								</upload>"+
"								<span style=\"color: #808695;\">请上传jpg或png格式的图片，大小不超过100KB</span>"+
"							</form-item>"+
"							<form-item>"+
"								<i-button type=\"primary\" @click=\"handleSubmit(\'user\')\" :loading=\"loadingStatus\">提交</i-button>"+
"								<i-button @click=\"handleReset(\'user\')\" style=\"margin-left: 8px\">重置</i-button>"+
"							</form-item>"+
"						</i-form>"+
"					</tab-pane>"+
"				</tabs>"+
"				<div slot=\"footer\"></div>"+
"			</Modal>"+
"		</div>";

