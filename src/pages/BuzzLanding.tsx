import { useState } from "react";
import { Link } from "react-router-dom";
import BuzzPublicPage, { publicPages } from "@/pages/BuzzPublicPage";
import { ArrowDownToLine, ArrowRight, CheckCheck, LockKeyhole, Menu, MessageCircle, Mic, Paperclip, Phone, Search, ShieldCheck, Users, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthPage from "@/pages/AuthPage";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import heroImage from "@/assets/buzz-hero-user.jpg";
import familyImage from "@/assets/buzz-family-call.jpg";
import groupImage from "@/assets/buzz-group-call.jpg";

type BubbleProps = { name?: string; children: React.ReactNode; own?: boolean; className?: string };

const Bubble = ({ name, children, own, className = "" }: BubbleProps) => (
  <div className={`w-fit max-w-[250px] rounded-md px-3 py-2 text-sm shadow-sm ${own ? "bg-landing-bubble" : "bg-card"} ${className}`}>
    {name && <p className="mb-0.5 text-xs font-semibold text-primary">{name}</p>}
    <div className="flex items-end gap-2"><span>{children}</span><span className="text-[10px] text-muted-foreground">11:59 {own && <CheckCheck className="inline h-3 w-3 text-primary" />}</span></div>
  </div>
);

const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" className={`flex items-center gap-2 font-bold ${light ? "text-primary-foreground" : "text-foreground"}`} aria-label="Buzz home">
    <span className="relative"><img src={buzzLogo} alt="Buzz" className="h-9 w-9 rounded-full object-cover" /><span className="absolute -bottom-1 -right-1 text-xs">🇮🇳</span></span>
    <span className="text-xl">Buzz</span>
  </a>
);

const TextLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <Button variant="link" onClick={onClick} className="group h-auto rounded-none px-0 inline-flex items-center gap-3 border-b-2 border-primary pb-1 text-base font-medium text-foreground">
    {children}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
);

const PhoneChat = ({ dark = false, group = false }: { dark?: boolean; group?: boolean }) => (
  <div className={`relative mx-auto aspect-[9/17] w-[270px] overflow-hidden rounded-[28px] border-[6px] shadow-2xl ${dark ? "border-landing-night bg-landing-night text-primary-foreground" : "border-card bg-landing-canvas"}`}>
    <div className={`flex items-center justify-between px-4 py-3 ${dark ? "bg-landing-night" : "bg-card"}`}>
      <div className="flex items-center gap-2"><span className="text-lg">‹</span><div className="h-8 w-8 rounded-full gradient-brand" /><div><p className="text-xs font-semibold">{group ? "Best Friends" : "Anika"}</p><p className="text-[9px] opacity-70">online</p></div></div>
      <div className="flex gap-3"><Video className="h-4 w-4" /><Phone className="h-4 w-4" /></div>
    </div>
    <div className="space-y-3 px-3 py-6">
      <Bubble name="Ayesha">Made it home safely!</Bubble>
      <Bubble own className="ml-auto">That was such a fun day 💜</Bubble>
      {group && <><Bubble name="Maya">Let’s plan this again?</Bubble><Bubble name="Ishaan">Ready whenever you are!</Bubble></>}
    </div>
    <div className={`absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full px-3 py-2 ${dark ? "bg-card/10" : "bg-card"}`}>
      <MessageCircle className="h-4 w-4" /><span className="flex-1 text-xs opacity-70">Message</span><Paperclip className="h-4 w-4" /><Mic className="h-4 w-4 text-primary" />
    </div>
  </div>
);

const DesktopApp = () => (
  <div className="relative mx-auto w-full max-w-[570px] rounded-md border border-border bg-card p-2 shadow-2xl">
    <div className="grid h-[330px] grid-cols-[38%_62%] overflow-hidden rounded-sm border border-border">
      <div className="border-r border-border bg-secondary/50 p-3">
        <div className="mb-4 flex items-center justify-between"><Logo /><Search className="h-4 w-4" /></div>
        <div className="space-y-3">{["Maya", "Ayesha", "Dario", "Family Group", "College Crew"].map((n, i) => <div key={n} className="flex gap-2"><div className="h-8 w-8 rounded-full gradient-brand opacity-80" /><div><p className="text-xs font-semibold">{n}</p><p className="text-[9px] text-muted-foreground">{i === 3 ? "Photo" : "See you soon!"}</p></div></div>)}</div>
      </div>
      <div className="relative bg-landing-canvas p-4"><p className="mb-6 text-sm font-semibold">Ayesha <span className="text-[10px] font-normal text-online">online</span></p><Bubble>Any plans for Saturday?</Bubble><Bubble own className="ml-auto mt-3">Let’s meet at the park.</Bubble><Bubble own className="ml-auto mt-3">Sounds amazing!</Bubble></div>
    </div>
    <div className="absolute -right-5 -top-8 w-32 rounded-md bg-landing-night p-3 text-primary-foreground shadow-xl"><p className="text-[10px] font-semibold">Incoming Buzz call</p><div className="mt-3 h-16 rounded bg-primary/40" /><div className="mt-3 flex justify-around"><span className="h-7 w-7 rounded-full bg-destructive" /><span className="h-7 w-7 rounded-full bg-online" /></div></div>
  </div>
);

const BuzzLanding = ({ page = "/" }: { page?: string }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openAuth = () => { setMenuOpen(false); setAuthOpen(true); };

  return (
    <div id="top" className="min-h-screen bg-landing-canvas text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-landing-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1160px] items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {[...publicPages].map(p => <Link key={p} to={`/${p}`} className="text-sm font-medium capitalize hover:text-primary">{p === "buzz-web" ? "Buzz Web" : p}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openAuth} className="hidden h-10 rounded-full border-foreground px-4 sm:inline-flex">Log In <ArrowRight /></Button>
            <InstallAppDialog trigger={<Button className="h-10 rounded-full px-4 gradient-brand">Download <ArrowDownToLine /></Button>} />
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <div className="border-t border-border bg-landing-canvas p-5 lg:hidden"><nav className="grid gap-4" aria-label="Mobile navigation">{publicPages.map(p => <Link key={p} to={`/${p}`} onClick={() => setMenuOpen(false)} className="capitalize">{p === "buzz-web" ? "Buzz Web" : p}</Link>)}<Button onClick={openAuth} variant="outline">Log In</Button></nav></div>}
      </header>

      <main>
        {publicPages.includes(page.slice(1) as typeof publicPages[number]) ? <BuzzPublicPage page={page.slice(1) as typeof publicPages[number]} onLogin={openAuth} /> : <>
        <section className="low-fade px-4 pt-2 sm:px-7">
          <div className="relative mx-auto min-h-[550px] max-w-[1288px] overflow-hidden rounded-[28px] bg-landing-night">
            <img src={heroImage} alt="A Buzz user messaging friends" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-landing-night/90 via-landing-night/25 to-transparent" />
            <div className="relative z-10 flex min-h-[550px] max-w-[470px] flex-col justify-center px-8 py-16 text-primary-foreground sm:px-20">
              <p className="mb-4 text-sm font-semibold">Made in India 🇮🇳</p>
              <h1 className="text-6xl font-normal leading-[0.95] sm:text-7xl">Message<br />privately</h1>
              <p className="mt-7 max-w-sm text-lg">Simple, reliable, private messaging and calling—without sharing your phone number.</p>
              <div className="mt-6 flex flex-wrap gap-3"><InstallAppDialog trigger={<Button className="h-13 rounded-full px-7 gradient-brand">Download <ArrowDownToLine /></Button>} /><Button onClick={openAuth} className="h-13 rounded-full bg-card px-7 text-foreground hover:bg-card/90">Log In <ArrowRight /></Button></div>
            </div>
            <div className="absolute right-[8%] top-[30%] hidden space-y-5 md:block"><Bubble name="Priya">Ready when you are!</Bubble><Bubble own className="ml-20">Still on for chai? ☕</Bubble></div>
          </div>
        </section>

        <section id="stories" className="low-fade mx-auto grid min-h-[570px] max-w-[1120px] items-center gap-16 px-7 py-20 lg:grid-cols-2">
          <DesktopApp />
          <div><h2 className="text-4xl font-normal leading-[1.02] sm:text-6xl">New! Call on<br />Buzz Web</h2><p className="mt-6 max-w-lg text-lg">Make and receive video or voice calls—one-to-one or in groups—right from your browser.</p><div className="mt-8"><TextLink onClick={openAuth}>Try it</TextLink></div></div>
        </section>

        <section id="features" className="relative mx-auto min-h-[440px] max-w-[1200px] overflow-hidden px-7 py-20 low-fade">
          <div className="absolute left-[5%] top-20"><Bubble own>Namaste! 👋</Bubble></div><div className="absolute right-[8%] top-36"><Bubble>Hello from Delhi</Bubble></div><div className="absolute bottom-24 left-[18%]"><Bubble>Bonjour!</Bubble></div><div className="absolute bottom-16 right-[15%]"><Bubble own>Hola!</Bubble></div>
          <h2 className="relative mx-auto mt-24 max-w-[900px] text-center text-3xl font-normal leading-[1.08] sm:text-6xl">With private messaging and calling, you can be yourself, speak freely and feel close to the people who matter most.</h2>
        </section>

        <section className="low-fade mx-auto grid min-h-[630px] max-w-[1080px] items-center gap-16 px-7 py-16 lg:grid-cols-2">
          <div><h2 className="text-4xl font-normal leading-[1.03] sm:text-6xl">Never miss a<br />moment with<br />voice and video<br />calls</h2><p className="mt-6 max-w-md text-lg">From a group call with classmates to a quick call with family, feel like you’re in the same room.</p><div className="mt-8"><TextLink onClick={openAuth}>Learn more</TextLink></div></div>
          <div className="relative mx-auto aspect-[9/16] w-[280px] overflow-hidden rounded-[28px] shadow-2xl"><img src={familyImage} alt="Indian family enjoying a Buzz video call" width={1024} height={1536} loading="lazy" className="h-full w-full object-cover" /><div className="absolute left-3 right-3 top-3 flex items-center justify-between text-primary-foreground"><span className="text-xs">End-to-end encrypted</span><Users className="h-5 w-5" /></div><div className="absolute inset-x-3 bottom-3 flex justify-around rounded-2xl bg-landing-night/90 p-3 text-primary-foreground"><span>•••</span><Video /><Mic /><span className="h-6 w-6 rounded-full bg-destructive" /></div></div>
        </section>

        <section id="download" className="low-fade mx-auto grid min-h-[570px] max-w-[1100px] items-center gap-20 px-7 py-20 lg:grid-cols-2">
          <DesktopApp />
          <div><h2 className="text-4xl font-normal leading-[1.03] sm:text-6xl">Get Buzz for<br />your desktop</h2><p className="mt-6 text-lg">Chat and call on a larger screen with Buzz Web.</p><div className="mt-9"><InstallAppDialog trigger={<Button className="h-13 rounded-full px-7 gradient-brand">Download Buzz <ArrowDownToLine /></Button>} /></div></div>
        </section>

        <section id="privacy" className="bg-landing-night text-primary-foreground">
          <div className="low-fade mx-auto grid min-h-[650px] max-w-[1100px] items-center gap-20 px-7 py-16 lg:grid-cols-2">
            <PhoneChat dark />
            <div><ShieldCheck className="mb-7 h-12 w-12 text-primary" /><h2 className="text-4xl font-normal leading-none sm:text-6xl">Speak<br /><span className="gradient-brand-text">freely</span></h2><p className="mt-7 max-w-md text-lg">Your personal messages and calls are protected in transit. Nearby chats use end-to-end encryption, so your conversations stay between you and the people you choose.</p><div className="mt-8"><Button variant="link" onClick={openAuth} className="h-auto px-0 text-primary-foreground">Start chatting <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div>
          </div>
        </section>

        <section id="groups" className="low-fade mx-auto grid min-h-[650px] max-w-[1080px] items-center gap-20 px-7 py-16 lg:grid-cols-2">
          <div><h2 className="text-4xl font-normal leading-none sm:text-6xl">Keep in touch<br />with your<br />groups</h2><p className="mt-7 max-w-md text-lg">Whether it’s planning an outing with friends or staying close to family, Buzz group conversations feel effortless.</p><div className="mt-8"><TextLink onClick={openAuth}>Log in to Buzz</TextLink></div></div>
          <div className="relative"><PhoneChat group /><div className="absolute -right-5 top-24 hidden w-44 overflow-hidden rounded-lg shadow-xl sm:block"><img src={groupImage} alt="Friends connected on Buzz" width={1536} height={1024} loading="lazy" className="aspect-video w-full object-cover" /></div></div>
        </section>
        </>}
      </main>

      <footer className="bg-landing-night px-7 py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-[1080px] flex-col justify-between gap-10 sm:flex-row"><div><Logo light /><p className="mt-5 text-sm text-primary-foreground/70">Made in India 🇮🇳</p><div className="mt-6"><InstallAppDialog trigger={<Button className="gradient-brand gap-2"><ArrowDownToLine className="h-4 w-4" /> Download</Button>} /></div></div><nav className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3" aria-label="Footer navigation">{publicPages.map(p => <Link key={p} to={`/${p}`} className="capitalize hover:text-primary">{p === "buzz-web" ? "Buzz Web" : p}</Link>)}</nav></div>
        <div className="mx-auto mt-14 flex max-w-[1080px] flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/20 pt-8 text-xs text-primary-foreground/60"><span>© 2026 Buzz · Made in India 🇮🇳</span><span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" /> Private by design</span></div>
      </footer>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}><DialogContent className="max-h-[95vh] max-w-md overflow-y-auto border-0 p-0"><AuthPage onAuth={() => setAuthOpen(false)} embedded /></DialogContent></Dialog>
    </div>
  );
};

export default BuzzLanding;