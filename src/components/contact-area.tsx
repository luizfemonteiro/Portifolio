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
