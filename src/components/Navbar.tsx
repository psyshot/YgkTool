import React, { useState, lazy, Suspense } from "react";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import {
	CheckCircleOutline,
	NotificationsOutlined,
	Apps as AppsIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
	Avatar,
	Badge,
	ListItemText,
	Theme,
	useMediaQuery,
	Grid,
} from "@mui/material";
import useNotifications from "@/utils/Hooks/useNotification";
import { useSidebar } from "@/contexts/sidebar";
import siteConfig from "src/site.config";
import { Capacitor } from "@capacitor/core";
import { isCapacitor, isWeb } from "@/utils/platform";
import { Button, CircularProgress } from "@mui/material";
import { useAccount } from "@/contexts/account";
import { useRouter } from "next/router";
import Image from "next/image";

function ElevationScroll(props: Props) {
	const { children } = props;

	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
	});

	return React.cloneElement(children, {
		elevation: trigger ? 3 : 0,
		sx: {
			borderBottom: trigger ? "" : "none",
		},
	});
}

interface Props {
	children: React.ReactElement;
}
function NotificationButton() {
	const [notifications, setRead] = useNotifications();
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const handleMarkAsRead = (id: number) => {
		setRead(id);
	};

	const open = Boolean(anchorEl);

	if (unreadCount === 0) return null;

	return (
		<>
			<IconButton
				edge="end"
				size="large"
				aria-label="notifications"
				onClick={handlePopoverOpen}
			>
				<Badge badgeContent={unreadCount} color="error">
					<NotificationsOutlined />
				</Badge>
			</IconButton>

			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handlePopoverClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				sx={{
					"& .MuiPopover-paper": {
						borderRadius: "28px",
						background: (theme) => theme.palette.background.default,
					},
				}}
			>
				<List
					sx={{
						width: "100%",
						maxWidth: 360,
						bgcolor: "background.paper",
					}}
				>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText primary="No notifications" />
						</ListItem>
					) : (
						notifications
							.filter((not) => !not.isRead)
							.reverse()
							.map((notification) => {
								const title = notification.content.split(
									"\n",
									1
								)[0];
								return (
									<ListItem
										key={notification.id}
										alignItems="flex-start"
										sx={{
											cursor: "pointer",
										}}
									>
										<ListItemText
											primary={title}
											secondary={notification.createDate}
										/>
										<IconButton
											edge="end"
											aria-label="mark as read"
											onClick={() =>
												handleMarkAsRead(
													notification.id
												)
											}
										>
											<CheckCircleOutline />
										</IconButton>
									</ListItem>
								);
							})
					)}
				</List>
			</Popover>
		</>
	);
}

function AppsMenu() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [hoverDescription, setHoverDescription] = useState<string>(
		"Discover more apps from YGeeker"
	);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const apps = [
		{
			name: "ClipMemo",
			icon: "https://www.ygeeker.com/image/product/clipmemo.png",
			link: "https://clipmemo.ygeeker.com",
			description: "Effortlessly capture and organize your ideas",
		},
		{
			name: "Dali",
			icon: "https://www.ygeeker.com/image/product/dali.png",
			link: "https://dali.ygeeker.com",
			description: "Create stunning AI-generated artwork",
		},
		{
			name: "I Didn't",
			icon: "https://www.ygeeker.com/image/product/ididnt.png",
			link: "https://ididnt.ygeeker.com",
			description: "Track habits you want to break",
		},
		{
			name: "FlowFerry",
			icon: "https://www.ygeeker.com/image/product/flowferry.png",
			link: "https://flowferry.ygeeker.com",
			description: "Streamline your workflow automation",
		},
		{
			name: "Currates",
			icon: "https://www.ygeeker.com/image/product/currates.png",
			link: "https://currates.ygeeker.com",
			description: "Curate and share your favorite content",
		},
		{
			name: "Timeline",
			icon: "https://www.ygeeker.com/image/product/timeline.png",
			link: "https://timeline.ygeeker.com",
			description: "Visualize your personal or project history",
		},
	];

	return (
		<>
			<IconButton
				onClick={handleClick}
				size="large"
				sx={{ color: "text.primary" }}
			>
				<AppsIcon />
			</IconButton>
			<Popover
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				sx={{
					"& .MuiPopover-paper": {
						borderRadius: "16px",
						background: (theme) => theme.palette.background.paper,
						width: "320px",
						padding: "24px",
						boxShadow: (theme) => theme.shadows[3],
					},
				}}
			>
				<Typography
					variant="h6"
					gutterBottom
					sx={{
						fontWeight: 500,
						marginBottom: "16px",
						fontFamily: "Product Sans",
					}}
				>
					More apps from YGeeker
				</Typography>
				<Grid container spacing={2}>
					{apps.map((app, index) => (
						<Grid item xs={4} key={index}>
							<Link legacyBehavior href={app.link} passHref>
								<Box
									component="a"
									target="_blank"
									rel="noopener noreferrer"
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										cursor: "pointer",
										padding: "8px",
										borderRadius: "12px",
										transition: "background-color 0.2s",
										"&:hover": {
											backgroundColor: (theme) =>
												theme.palette.action.hover,
										},
										textDecoration: "none",
										color: "inherit",
									}}
									onMouseEnter={() =>
										setHoverDescription(app.description)
									}
								>
									<Box
										sx={{
											width: 56,
											height: 56,
											borderRadius: "12px",
											overflow: "hidden",
											marginBottom: "8px",
										}}
									>
										<Image
											src={app.icon}
											alt={app.name}
											width={56}
											height={56}
										/>
									</Box>
									<Typography
										variant="body2"
										align="center"
										sx={{ fontWeight: 500 }}
									>
										{app.name}
									</Typography>
								</Box>
							</Link>
						</Grid>
					))}
				</Grid>
				<Typography
					variant="caption"
					sx={{
						display: "block",
						textAlign: "center",
						marginTop: "16px",
						minHeight: "2em",
					}}
				>
					{hoverDescription}
				</Typography>
			</Popover>
		</>
	);
}

const AccountPanel = lazy(() => import("./AccountPanel"));

export default (props: { title: string; PageAction; repo: string }) => {
	const { title, PageAction, repo } = props;

	const { sidebar, setSidebar } = useSidebar();
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const { account } = useAccount();
	const hidden = useMediaQuery((theme: Theme) =>
		theme.breakpoints.down("sm")
	);
	const router = useRouter();
	const isRootRoute = router.pathname === "/";

	return (
		<>
			<ElevationScroll {...props}>
				<AppBar
					color="secondary"
					position="fixed"
					sx={{
						zIndex: (theme) => theme.zIndex.drawer + 1,
					}}
				>
					<Toolbar
						sx={{
							bgcolor: (theme) =>
								theme.palette.background.default,
							justifyContent: "space-between",
							paddingTop: "var(--ion-safe-area-top)",
						}}
					>
						<IconButton
							edge="start"
							size="large"
							aria-label="Toggle drawer"
							onClick={() => setSidebar(!sidebar)}
						>
							<MenuTwoToneIcon />
						</IconButton>

						<Link href="/" legacyBehavior>
							<Typography
								component="span"
								variant="h6"
								color="textPrimary"
								sx={{
									fontFamily: "Product Sans",
									cursor: "pointer",
								}}
							>
								{siteConfig.title}
							</Typography>
						</Link>
						<Typography
							color="primary"
							variant="h6"
							noWrap
							sx={{
								overflow: "hidden",
								fontFamily: "Product Sans",

								marginLeft: ".4em",
							}}
						>
							{title}
						</Typography>

						<Box sx={{ flexGrow: 1 }} />

						{!hidden && <AppsMenu />}

						{(!hidden || isRootRoute) && (
							<>
								<NotificationButton />
								<IconButton
									onClick={() => setShowLoginDialog(true)}
									sx={{ marginLeft: 2 }}
								>
									<Avatar
										src={
											account
												? account["avatarUrl"]
												: null
										}
										alt={
											account
												? account["user"]["email"]
												: "User"
										}
									/>
								</IconButton>
							</>
						)}

						{PageAction}
					</Toolbar>
				</AppBar>
			</ElevationScroll>
			{showLoginDialog && (
				<Suspense fallback={<CircularProgress />}>
					<AccountPanel
						open={showLoginDialog}
						onClose={() => setShowLoginDialog(false)}
					/>
				</Suspense>
			)}
		</>
	);
};
