"use client";

import Image from "next/image";
import type { BookData } from "@/lib/book";

export function AboutView({ data }: { data: BookData }) {
  const meta = data.meta;
  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">About this Book</h2>
        <div aria-hidden className="rule-double mt-3 mb-5" />
        <div className="grid sm:grid-cols-[170px_1fr] gap-6 items-start">
          <Image
            src="/images/cover.jpg"
            alt="Cover of the 1941 edition of Meditations of St. Thomas Aquinas"
            width={340}
            height={533}
            className="w-[170px] rounded-md border shadow-sm"
          />
          <div>
            <p className="text-[17px] leading-relaxed">
              <span className="font-semibold">{meta.bookTitle}</span>
              <span className="text-muted-foreground"> — {meta.subtitle}.</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {meta.adaptedFrom}.<br />
              By <span className="text-foreground font-medium">{meta.author}</span>, professor at
              Aquinas High School and chaplain of Mount Carmel Hospital, Columbus, Ohio.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {meta.publisher}, {meta.year}. {meta.copyright}.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              The original compiler of the Latin edition was Father Mezard, O.P., who published it
              in 1905 with the approval of the Very Reverend Edward Hugon, O.P. Some four hundred
              meditations, taken mostly from the <em>Summa Theologica</em>, are arranged with
              references to the original, for daily use throughout the year.
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="about-arrangement">
        <h3 id="about-arrangement" className="text-smallcaps text-[17px] font-medium text-primary">
          How the book is arranged
        </h3>
        <div aria-hidden className="rule-double my-3" />
        <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
          <p>
            The volume is in two parts. <strong>Part I</strong> runs from Advent to the Feast of the
            Sacred Heart: Advent meditations on the Incarnation, then the Birth, Infancy and Public
            Life of Our Lord; Lent is given to His Sufferings and Death; and the Paschal season to
            the Risen Christ, grace, the Holy Ghost and the Eucharist, ending with the Sacred Heart.
          </p>
          <p>
            <strong>Part II</strong> extends from July to Advent through five sections — God and His
            attributes, the purgative, illuminative and unitive ways of spiritual advancement, and
            the four last things — followed by seventeen topics for spiritual retreats and the
            prayers of St. Thomas.
          </p>
          <p>
            Days are assigned as the book prints them: some meditations are fixed to calendar
            dates, while the greater part of the liturgical year (from Septuagesima to the octave of
            Corpus Christi) moves with Easter. On this site those days are resolved from the
            traditional (1962) calendar by computing Easter for the year you are browsing, so the
            default meditation always matches the liturgical day. The first, second and third
            Sundays of October carry the Rosary, Maternity and Purity meditations as in the book.
          </p>
        </div>
      </section>

      <section aria-labelledby="about-plate">
        <h3 id="about-plate" className="text-smallcaps text-[17px] font-medium text-primary">
          St. Thomas Aquinas
        </h3>
        <div aria-hidden className="rule-double my-3" />
        <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-start">
          <Image
            src="/images/frontispiece.jpg"
            alt="Frontispiece: St. Thomas Aquinas"
            width={440}
            height={724}
            className="w-[220px] rounded-md border shadow-sm"
          />
          <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p>
              Saint Thomas Aquinas, O.P. (about 1225–1274), the most illustrious member of the
              Dominican Order, is called the Angelic Doctor, Prince of Theologians and the
              Eucharistic Doctor, and is the patron of all Catholic schools.
            </p>
            <p className="italic text-muted-foreground">
              &ldquo;O Blessed Thomas, Patron of Schools, obtain for us from God an invincible
              faith, burning charity, a chaste life and true knowledge, through Christ Our Lord.
              Amen.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-refs">
        <h3 id="about-refs" className="text-smallcaps text-[17px] font-medium text-primary">
          Explanation of references (from the book)
        </h3>
        <div aria-hidden className="rule-double my-3" />
        <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
          {data.referencesNote.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-dedication">
        <h3 id="about-dedication" className="text-smallcaps text-[17px] font-medium text-primary">
          Dedication
        </h3>
        <div aria-hidden className="rule-double my-3" />
        <p className="text-[15px] leading-relaxed text-foreground/90">{meta.dedication}</p>
        <p className="mt-6 text-[14px] leading-relaxed text-muted-foreground whitespace-pre-line">
          {meta.nihilObstat}
        </p>
        <p className="mt-4 text-[14px] text-muted-foreground">
          Text transcribed from the 1941 third printing of the second edition (scanned copy).
          Occasional typographical oddities remain from the original scan.
        </p>
      </section>
    </div>
  );
}
