import OutlinedCard from "../components/OutlinedCard";
import StyledMarkdown from "../components/StyledMarkdown";
import Avatar from "@mui/material/Avatar";
import { makeStyles, createStyles, Theme } from "@mui/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import MailIcon from "@mui/icons-material/Mail";
import { GetStaticProps } from "next";
import { author, repo } from "../site.config";
import translator from "@/utils/translator";

interface AboutProps extends GetStaticProps {
	aboutContent: string;
}

export const getStaticProps: GetStaticProps = ({ locale }) => {
	const dic = require("../data/i18n/i18n.json");

	const trans = new translator(dic, locale);

	const aboutContent = require("../../data/article/" +
		locale +
		"/about.md").default;

	return {
		props: {
			currentPage: {
				title: trans.use(""),
				description: trans.use(""),
				path: "/about",
			},
			dic: JSON.stringify(trans.get()),
			aboutContent,
			locale,
		},
	};
};

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		authorName: {
			transform: "translateY(-10px)",
		},
		avatar: {
			transform: "translateY(-50%)",
			marginLeft: "calc(50% - 50px)",
			boxShadow: "0px 0px 4px 4px rgb(0 0 0 / 10%)",
		},
		contactGroup: {
			display: "flex",
			justifyContent: "center",
			paddingBottom: "10px",
		},
		authorCard: {
			marginTop: 80,
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
		},
	})
);

export default function About({ aboutContent }: AboutProps) {
	const classes = useStyles();
	return (
		<div style={{ maxWidth: "600px", margin: "0 auto" }}>
			<OutlinedCard className={classes.authorCard}>
				<Avatar
					className={classes.avatar}
					alt="Remy Sharp"
					src="https://avatars.githubusercontent.com/u/52880665?v=4"
					sx={{ width: 100, height: 100 }}
				/>
				<div className={classes.authorName}>
					<Typography align="center" variant="subtitle2">
						Developed and designed by{" "}
					</Typography>
					<Typography align="center" variant="h6">
						RiverTwilight
					</Typography>
				</div>

				<div className={classes.contactGroup}>
					<IconButton href={repo} aria-label="github">
						<GitHubIcon />
					</IconButton>
					{author.twitter && (
						<IconButton
							href={author.twitter}
							aria-label="Go to author's twitter profile"
						>
							<TwitterIcon />
						</IconButton>
					)}
					{author.email && (
						<IconButton
							href={`maileto://${author.email}`}
							aria-label="Send an email to me"
						>
							<MailIcon />
						</IconButton>
					)}
				</div>
			</OutlinedCard>
			<br />
			<OutlinedCard padding={2}>
				<StyledMarkdown content={aboutContent} />
			</OutlinedCard>
		</div>
	);
}
