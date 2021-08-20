import React from "react";
// @ts-expect-error ts-migrate(2305) FIXME: Module '"mdui"' has no exported member 'alert'.
import { snackbar, alert as mduiAlert } from "mdui";
import ClipboardJS from "clipboard";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/socket.io-client` if it ex... Remove this comment to see the full error message
import io from "socket.io-client";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/qrcode` if it exists or ad... Remove this comment to see the full error message
import QRCode from "qrcode";
import saveFile from "../../utils/fileSaver";
import { Input, Button } from "mdui-in-react";
import FileInput from "../../components/FileInput";

const Share = ({ qrcode, token }: any) => (
	<>
		<ul className="mdui-menu" id="share">
			<img alt="扫描此二维码" src={qrcode}></img>

			<li>
				从其他设备访问此页链接[
				<a
					data-clipboard-text={window.location.href + "#/" + token}
					className="mdui-text-color-theme copy"
				>
					&nbsp;复制&nbsp;
				</a>
				]或扫描二维码
			</li>
		</ul>

		<button
			mdui-menu="{target: '#share',gutter:'-20', covered:false}"
			className="mdui-btn"
		>
			添加设备
		</button>
	</>
);

const MsgList = ({ data, qrcode, token }: any) => {
	const list = data.map((a: any, i: any) => {
		if (a.type === "text") {
			return (
				<li
					onClick={() => {
						mduiAlert(a.content, () => {}, { history: false });
					}}
					key={i}
					className="mdui-list-item mdui-ripple"
				>
					<i className="mdui-list-item-avatar mdui-icon material-icons">
						assignment
					</i>

					<div className="mdui-list-item-content">
						<div className="mdui-list-item-title mdui-list-item-two-line">
							{a.content}
						</div>

						<div className="mdui-list-item-text mdui-list-item-one-line">
							{a.time}
						</div>
					</div>

					<button
						data-clipboard-text={a.content}
						className="copy mdui-btn mdui-btn-icon"
					>
						<i className="mdui-list-item-icon mdui-icon material-icons">
							content_copy
						</i>
					</button>
				</li>
			);
		} else {
			return (
				<li key={i} className="mdui-list-item mdui-ripple">
					<i className="mdui-list-item-avatar mdui-icon material-icons">
						folder
					</i>

					<div className="mdui-list-item-content">
						<div className="mdui-list-item-title">
							{a.content.name}
						</div>

						<div className="mdui-list-item-text">
							{a.content.size}
						</div>
					</div>

					<button
						onClick={() => {
							// @ts-expect-error ts-migrate(2345) FIXME: Property 'type' is missing in type '{ file: any; f... Remove this comment to see the full error message
							saveFile({
								file: a.content.data,
								filename: a.content.name,
							});
						}}
						className="mdui-btn mdui-btn-icon"
					>
						<i className="mdui-icon material-icons">
							file_download
						</i>
					</button>
				</li>
			);
		}
	});
	return (
		<>
			<ul className="mdui-list mdui-row-md-2">{list}</ul>
			<p className="mdui-text-center">
				<Share qrcode={qrcode} token={token} />
			</p>
		</>
	);
};

type ComponentState = {
	connectState: string;
	textData?: string;
	receivedData: any[];
	fileData?: any;
	token?: string | number;
	originTitle: string;
	socket?: any;
	deviceId?: number;
	qrcode?: string;
	pwd?: any;
};

class Clipboard extends React.Component<{}, ComponentState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			textData: "",
			fileData: null,
			receivedData: [],
			token: "", //所有设备的共同口令
			// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
			deviceId: parseInt(Math.random() * (9999 - 0 + 1) + 0, 10), //当前设备标识口令
			qrcode: "",
			socket: null,
			pwd: null,
			originTitle: document.title,
			connectState: "ok",
		};
	}
	componentWillMount() {
		if (window.location.hash) {
			//如果链接有hash信息保存为token
			// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
			var token = /^\#\/(\d+)$/.exec(window.location.hash)[1];
			this.setState({
				token: Number(token),
			});
		} else {
			//没有则生成token
			const td = new Date();
			// @ts-expect-error ts-migrate(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
			var token = td.getTime();
			this.setState({
				token: token,
			});
		}
	}
	componentWillUnmount() {
		this.state.socket.close();
		window.removeEventListener("visibilitychange", this.handleVisibility);
	}
	handleVisibility = () => {
		//还原默认标题
		if (!document.hidden) {
			document.title = this.state.originTitle;
		}
	};
	componentDidMount() {
		window.addEventListener("visibilitychange", this.handleVisibility);

		const cb = (data: any) => {
			this.setState(data);
			if (document.hidden) {
				if (document.title.match("新消息")) {
				} else {
					document.title = "(新消息)" + document.title;
				}
			}
		};

		// @ts-expect-error ts-migrate(2454) FIXME: Variable 'clipboard' is used before being assigned... Remove this comment to see the full error message
		clipboard && clipboard.destroy();
		var clipboard = new ClipboardJS(".copy");
		clipboard.on("success", (e) => {
			snackbar({ message: "已复制" });
			e.clearSelection();
		});

		const { token, receivedData, deviceId } = this.state;

		QRCode.toDataURL(
			window.location.href + "#/" + this.state.token,
			(err: any, url: any) => {
				if (err) throw err;
				cb({
					qrcode: url,
				});
			}
		);

		const socket = io("wss://ygk-api.yunser.com", {
			path: "/clipboard",
			query: {
				token: token,
			},
			transports: ["websocket"], //取消轮询
		});

		this.setState({ socket: socket });

		socket.on("disconnect", (msg: any) => {
			this.setState({
				connectState: "正在尝试重连...",
			});
		});

		socket.on("connect", () => {
			this.setState({
				connectState: "OK",
			});
		});

		socket.on("chat_message", (msg: any) => {
			if (msg.deviceId === deviceId) {
				console.log("clint message");
				window.loadHide();
				// 接收到本机消息后清空草稿
				if (msg.type === "text") {
					this.setState({
						textData: "",
					});
				} else {
					this.setState({
						fileData: null,
					});
				}
			}
			let { type, content, time } = msg;
			let newData = { type, content, time };
			receivedData.push(newData);
			cb({ data: receivedData, content: "" });
		});
	}
	sendMsg() {
		window.loadShow();
		const metaDate = new Date().toLocaleTimeString();
		const { textData, fileData, token, socket, pwd, deviceId } = this.state;
		textData !== "" &&
			socket.emit("chat_message", {
				content: textData,
				type: "text",
				token,
				time: metaDate,
				deviceId,
			});
		fileData &&
			socket.emit("chat_message", {
				content: fileData,
				type: "file",
				token,
				time: metaDate,
				deviceId,
			});
	}
	render() {
		const {
			qrcode,
			receivedData,
			textData,
			token,
			connectState,
		} = this.state;
		return (
			<>
				<MsgList token={token} qrcode={qrcode} data={receivedData} />
				<div className="bottom-dashboard mdui-card mdui-p-a-1">
					<Input
						onValueChange={(newText) => {
							this.setState({
								textData: newText,
							});
						}}
						rows={2}
						// @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number | ... Remove this comment to see the full error message
						maxlength="3000"
						header="输入要发送的内容，大于3000字符请发送文件"
						value={textData}
					/>

					<Button
						title="发送"
						onClick={this.sendMsg.bind(this)}
						ripple
						raised
						primary
						className="loadBtn mdui-float-right"
					/>

					<Button
						icon="wifi"
						title={connectState}
						className="mdui-float-left"
					/>
					{/*<button
                        onClick={()=>{
                            mdui.prompt(
                                '',
                                '设置密码',
                                value => {this.setState({pwd:value})},
                                value => {}, {
                                    type: 'text',
                                    maxlength: 20,
                                    confirmText: '保存',
                                    cancelText: '取消',
                                    history:false
                                }
                            )
                        }}
                        className="mdui-float-right mdui-btn">
                        <i className="mdui-icon-left mdui-icon material-icons">vpn_key</i>
                        设置密码
                    </button>*/}

					<span
						style={{ marginRight: "5px" }}
						className="mdui-float-right"
					>
						<FileInput
							maxSize={3 * 1024 * 1024}
							readbydrag
							fileType="*/*"
							handleFileUpload={(dataUrl, file) => {
								this.setState({
									fileData: {
										// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
										name: file.name,
										size:
											Math.round(
												// @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
												(file.size / 1024) * 10
											) /
												10 +
											"KB",
										data: dataUrl,
									},
								});
							}}
						/>
					</span>
				</div>
			</>
		);
	}
}

export default Clipboard;