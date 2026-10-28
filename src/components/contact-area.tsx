import ContactCards, { type ContributionDay } from '@/components/ui/contact-cards';
import { contact, base } from '../data.js';
import { useLang } from '../i18n.jsx';
import { handleCvClick } from '../cv.js';
import Reveal from './Reveal.jsx';
import SectionTitle from './SectionTitle.jsx';

// Fotos de cada rede: src/assets/foto-instagram.jpg, foto-linkedin.jpg, foto-github.jpg (ou .png/.webp)
const networkPhotos = import.meta.glob('../assets/foto-*.{jpg,jpeg,png,webp}', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;
const networkPhoto = (name: string) =>
	Object.entries(networkPhotos).find(([path]) => path.includes(`/foto-${name}.`))?.[1];

const lastSegment = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? '';
const isPlaceholder = (url: string) => /SEU-USUARIO/.test(url);

/** Só para a prévia online (que bloqueia chamadas externas): atividade fictícia. */
function sampleDays(): ContributionDay[] {
	const start = new Date();
	start.setUTCDate(start.getUTCDate() - 370);
	return Array.from({ length: 371 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(date.getUTCDate() + index);
		const wave = Math.sin(index / 9) + Math.sin(index / 23) + Math.sin(index / 3.5);
		const weekday = date.getUTCDay();
		const quieter = weekday === 0 || weekday === 6 ? 0.35 : 1;
		return {
			date: date.toISOString().slice(0, 10),
			count: Math.max(0, Math.round((wave + 1.4) * 3 * quieter)),
		};
	});
}

function WhatsappIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-7" fill="none">
			<rect width="24" height="24" rx="5" fill="#25D366" />
			<path
				fill="#fff"
				transform="translate(4.5, 4.5) scale(0.65)"
				d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.8 8.1 19.11L7.81 18.94L4.69 19.76L5.52 16.71L5.33 16.4C4.58 15.2 4.19 13.82 4.19 11.92C4.19 7.38 7.89 3.67 12.04 3.67ZM8.82 7.15C8.64 7.15 8.35 7.22 8.11 7.48C7.87 7.74 7.2 8.36 7.2 9.63C7.2 10.9 8.13 12.13 8.26 12.3C8.39 12.47 10.08 15.08 12.67 16.2C13.29 16.46 13.77 16.62 14.15 16.74C14.77 16.94 15.34 16.91 15.79 16.84C16.29 16.77 17.33 16.21 17.55 15.59C17.77 14.97 17.77 14.44 17.7 14.33C17.63 14.22 17.46 14.15 17.2 14.02C16.94 13.89 15.66 13.26 15.42 13.17C15.18 13.08 15.01 13.04 14.84 13.3C14.67 13.56 14.18 14.15 14.03 14.33C13.88 14.5 13.73 14.52 13.47 14.39C13.21 14.26 12.38 13.99 11.4 13.11C10.63 12.42 10.11 11.58 9.96 11.32C9.81 11.06 9.94 10.92 10.07 10.79C10.19 10.67 10.34 10.48 10.47 10.33C10.6 10.18 10.65 10.07 10.74 9.9C10.83 9.73 10.78 9.58 10.72 9.45C10.66 9.32 10.18 8.14 9.98 7.66C9.79 7.19 9.59 7.25 9.44 7.24C9.3 7.24 8.96 7.24L8.82 7.15Z"
			/>
		</svg>
	);
}

function LinkedinIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-7">
			<rect width="24" height="24" rx="5" fill="#0A66C2" />
			<path
				transform="translate(5.1 4.9) scale(0.58)"
				fill="#fff"
				d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.75-1.95 4 0 4.4 2.4 4.4 5.6V21h-4v-5.6c0-1.35-.03-3.1-1.9-3.1-1.9 0-2.2 1.45-2.2 2.99V21h-4V9Z"
			/>
		</svg>
	);
}

function InstagramIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-7">
			<defs>
				<linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
					<stop offset="0" stopColor="#feda75" />
					<stop offset="0.25" stopColor="#fa7e1e" />
					<stop offset="0.5" stopColor="#d62976" />
					<stop offset="0.75" stopColor="#962fbf" />
					<stop offset="1" stopColor="#4f5bd5" />
				</linearGradient>
			</defs>
			<rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
			<rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
			<circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.6" />
			<circle cx="16.1" cy="7.9" r="0.9" fill="#fff" />
		</svg>
	);
}

function Avatar({ photoUrl, size }: { photoUrl?: string; size: string }) {
	return photoUrl ? (
		<img
			src={photoUrl}
			alt=""
			className={`block ${size} shrink-0 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900`}
		/>
	) : (
		<span
			className={`block ${size} shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 ring-4 ring-white dark:ring-zinc-900`}
		/>
	);
}

function ProfileCard({
	banner,
	photoUrl,
	title,
	text,
}: {
	banner: string;
	photoUrl?: string;
	title: string;
	text: string;
}) {
	return (
		<div className="w-72">
			<div className={`h-16 ${banner}`} />
			<div className="flex flex-col gap-1 px-4 pt-2 pb-4">
				<div className="-mt-11 mb-1 w-fit">
					<Avatar photoUrl={photoUrl} size="size-14" />
				</div>
				<span className="font-medium">{title}</span>
				<span className="text-sm text-zinc-500">{text}</span>
			</div>
		</div>
	);
}

export default function ContactArea({ photoUrl, cvUrl }: { photoUrl?: string; cvUrl?: string }) {
	const { t } = useLang();
	const c = t.contact;
	const preview = Boolean(import.meta.env.VITE_PREVIEW);
	const githubUser = lastSegment(contact.github);
	const githubReady = !isPlaceholder(contact.github);
	const githubAvatar =
		networkPhoto('github') ??
		(githubReady && !preview ? `https://github.com/${githubUser}.png?size=80` : undefined) ??
		photoUrl;

	return (
		<section id="contato" className="section contact">
			<div className="wrap">
				<SectionTitle index={5}>{c.title}</SectionTitle>
				<Reveal as="p" className="contact-text">{c.text}</Reveal>

				<ContactCards
					className="contact-cards"
					email={contact.email}
					locale={t.locale}
					labels={{
						copy: c.copy,
						copied: c.copied,
						contributions: c.contributions,
						unit: c.unit,
					}}
					github={{
						username: githubUser,
						url: contact.github,
						days: preview ? sampleDays() : githubReady ? undefined : [],
						avatar: githubAvatar ? (
							<img src={githubAvatar} alt="" className="block size-10 shrink-0 rounded-full object-cover" />
						) : undefined,
					}}
					links={[
						{
							label: 'WhatsApp',
							href: contact.whatsapp,
							icon: <WhatsappIcon />,
							card: (
								<ProfileCard
									banner="bg-gradient-to-br from-[#25D366] to-[#128C7E]"
									photoUrl={networkPhoto('whatsapp') ?? photoUrl}
									title="WhatsApp"
									text={c.whatsappText ?? contact.whatsappRaw}
								/>
							),
						},
						{
							label: 'LinkedIn',
							href: contact.linkedin,
							icon: <LinkedinIcon />,
							card: (
								<ProfileCard
									banner="bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/30"
									photoUrl={networkPhoto('linkedin') ?? photoUrl}
									title={base.name}
									text={c.linkedinText}
								/>
							),
						},
						{
							label: 'Instagram',
							href: contact.instagram,
							icon: <InstagramIcon />,
							card: (
								<ProfileCard
									banner="bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]"
									photoUrl={networkPhoto('instagram') ?? photoUrl}
									title={`@${lastSegment(contact.instagram)}`}
									text={c.instagramText}
								/>
							),
						},
					]}
				/>

				<p className="contact-note">
					{c.note} <a href={`mailto:${contact.email}`}>{contact.email}</a>
				</p>

				{cvUrl && (
					<a className="btn btn-primary" href={cvUrl} download={c.cvFile} onClick={(e) => handleCvClick(e, cvUrl, c.cvFile)}>
						{c.cv}
					</a>
				)}
			</div>
		</section>
	);
}
