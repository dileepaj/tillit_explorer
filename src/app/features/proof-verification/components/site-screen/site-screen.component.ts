import { trigger, style, animate, transition } from "@angular/animations";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild, 
  Input
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { VerificationServiceService } from "../../../../services/verification-service.service";
import Url from "url-parse";
 
@Component({
  selector: "app-site-screen",
  templateUrl: "./site-screen.component.html",
  styleUrls: ["./site-screen.component.css"],
  animations: [
    trigger("screenAnimation", [
      transition(":enter", [
        style({ transform: "translateY(400px)", opacity: 0 }),
        animate("800ms", style({ transform: "translateY(0%)", opacity: 1 }))
      ])
    ]),
    trigger("spinAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-100%)", opacity: 0 }),
        animate("2000ms", style({ transform: "translateY(0px)", opacity: 1 }))
      ]),
      transition(":leave", [
        style({ transform: "translateY(0px)", opacity: 1 }),
        animate("800ms", style({ transform: "translateY(-100%)", opacity: 0 }))
      ])
    ]),
    trigger("inOutAnimation", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("100ms ease-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate("100ms ease-in", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SiteScreenComponent implements OnInit {
  text: string = "";
  HTMLData: string = "";
  displayPageUrl: any = "Search or type a URL...";
  loadingComplete: boolean = true;
  isCopied: boolean = false;
  FrameTitle: string = "";
  scale: number = 1;
  frameIndex: number = 1;
  scrolling: string = "no";
  textStyles: any = [];
  pointerIcon: string = "";
  isScrollToElement: boolean = true;
  isPointToElement: boolean = true;
  @Input() lang: string = "en";

  @ViewChild("iframe", { read: ElementRef, static: false }) iframe: ElementRef;

  constructor(
    private verificationHttpService: VerificationServiceService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private cdref: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // let scripts = this.iframe.nativeElement.getElementsByTagName("script");
    // for (let script of scripts) {
    //   eval(script.text);
    // }
    // // eval(scripts[0].text);
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  // scroll into the current running iframe element
  async scrollIntoView() {
    await this.scrollToFrameById("verificationScreen", 10);
    const sFrame = document.querySelectorAll("#verificationScreen #frames")[0];
    const el: any = document.querySelectorAll(
      "#verificationScreen #frames app-site-screen"
    )[this.frameIndex];
    var left: number = el.getBoundingClientRect().left;
    left =
      this.elRef.nativeElement.offsetLeft - sFrame.getBoundingClientRect().left;
    left = el.offsetLeft;
    // console.log(sFrame.scrollLeft, left, sFrame.clientLeft);
    // if (sFrame.scrollLeft == 0 || sFrame.scrollLeft > left)
    //   left -= sFrame.getBoundingClientRect().left;
    sFrame.scroll({
      top: 0,
      left: left,
      behavior: "smooth"
    });
    await this.sleepFor(400);
  }

  // scroll to a specific element provided by the query
  //and if the show pointer is available then scroll to it
  async scrollToSelector(
    query: string,
    index: number = 0,
    yOffset: number = 0,
    xOffset: number = 0
  ) {
    try {
      var iframe = this.iframe.nativeElement;
      var currentFrame = iframe.contentWindow;
      var selectorFrame = iframe.contentWindow.document
        .querySelectorAll(query)
        [index].getBoundingClientRect();

      // scroll to the element in the query
      if (this.isScrollToElement) {
        await this.scrollIntoView();
        await this.sleepFor(400);
        iframe.contentWindow.scroll({
          top: currentFrame.scrollY + selectorFrame.y - yOffset,
          left: currentFrame.scrollX + selectorFrame.x - xOffset,
          behavior: "smooth"
        });
        await this.sleepFor(400);
      }

      // scroll to the pointer
      if (this.isPointToElement) {
        selectorFrame = iframe.contentWindow.document
          .querySelectorAll(query)
          [index].getBoundingClientRect();

        const selectorHeightInFrame =
          this.iframe.nativeElement.getBoundingClientRect().height -
          selectorFrame.top;

        const selectorWidthInFrame =
          this.iframe.nativeElement.getBoundingClientRect().width -
          selectorFrame.left;

        var elWidth = selectorFrame.width;
        var elHeight = selectorFrame.height;

        // check if entire selected frame is visible on screen -> scroll to its center; else
        // check the height & width of the frame to the screen end -> scroll to their center
        if (selectorHeightInFrame < elHeight) elHeight = selectorHeightInFrame;
        if (selectorWidthInFrame < elWidth) elWidth = selectorWidthInFrame;

        const bodyFrameRect = iframe.contentWindow.document.body.getBoundingClientRect();
        // const maxWidth = iframe.contentWindow.innerWidth;
        // const maxHeight = iframe.contentWindow.innerHeight;
        // elWidth = elWidth > maxWidth ? maxWidth : elWidth;
        // elHeight = elHeight > maxHeight ? maxHeight : elHeight;

        this.scrollPointerIntoView(
          selectorFrame.x - bodyFrameRect.x + elWidth / 2 + "px",
          selectorFrame.y - bodyFrameRect.y + elHeight / 2 + "px"
        );
      } else this.scrollPointerIntoView("0", "-1000");
    } catch (error) {}
  }

  // scroll to a specific frameby id in global scope
  async scrollToFrameById(frameID: string, lower = 0) {
    const bodyRect: any = document.body.getBoundingClientRect();
    const pcRect: any = document
      .getElementById(frameID)
      .getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    var visibleDoc = bodyRect.top + bodyRect.height;
    var visiblPC = pcRect.height * 0.5 + pcRect.top;
    var top = pcHeight - (bodyRect.height - pcRect.height);
    // console.log(pcRect.top, bodyRect.top);
    // console.log(visibleDoc, visiblPC, visibleDoc - visiblPC);
    if (visibleDoc - visiblPC < 0) {
      window.scroll({
        top,
        left: pcWidth,
        behavior: "smooth"
      });
      await this.sleepFor(400);
    }
  }

  setFrameIndex(frameIndex: number) {
    this.frameIndex = frameIndex;
  }

  async setPage(
    pageUrl: string,
    isTranslate: boolean = false,
    lang: string = "en"
  ) {
    this.resetFramePage();
    await this.scrollIntoView();
    this.loadingComplete = false;
    this.HTMLData = null;
    await this.sleepFor(1400);
    return new Promise(async (resolve, reject) => {
      var translateUrl = isTranslate
        ? `https://qa.gateway.tracified.com/enable-cors?web=http://translate.google.com/translate?hl=bg%26ie=UTF-8%26u=${pageUrl}%26sl=auto%26tl=${lang}`
        : pageUrl;

      // console.log(isTranslate, lang, translateUrl);
      this.displayPageUrl = pageUrl;
      this.verificationHttpService.loadPage(translateUrl).subscribe(
        async data => {
          try {
            // this.iframe.nativeElement.contentWindow.location.pathname = '/multiplecompare/[{"title":"sasasa","t1":"qwqwqw","t2":"212dsdsd"}]';

            await this.sleepFor(2200);

            // extract the domain url (for exterrnaol js files and css)
            var domainUrl = pageUrl
              .split("/")
              .filter(n => n)
              .join("/");

            var parsedUrl = new Url(domainUrl);
            // console.log(parsedUrl);

            if (
              pageUrl
                .split("/")
                .slice(-1)[0]
                .search(".") != -1 &&
              ["html", "php"].includes(
                pageUrl
                  .split("/")
                  .slice(-1)[0]
                  .split(".")
                  .slice(-1)[0]
              )
            )
              domainUrl = pageUrl
                .split("/")
                .slice(0, -1)
                .join("/");
            else domainUrl = parsedUrl.origin;

            // format json data
            if (this.isJSON(data)) {
              // data = JSON.stringify(data, undefined, 2)
              data = `<pre><code>${data}</code></pre>`;
            }

            // console.log(data);

            // replace sripts
            this.HTMLData = data.replace(
              /src="(?!http)[\/]?/g,
              `src="${domainUrl}/`
            );

            // replace css
            this.HTMLData = this.HTMLData.replace(
              /href="(?!http)[\/]?/g,
              `href="${domainUrl}/`
            );
            var htmlEl = document.createElement("html");
            htmlEl.innerHTML = this.HTMLData;

            var bodyEL = htmlEl.getElementsByTagName("body")[0];

            let bodyELStyle = bodyEL.getAttribute("style");
            var newBodyStyle =
              "pointer-events: none; cursor: pointer; position: relative !important";
            bodyEL.setAttribute(
              "style",
              bodyELStyle ? bodyELStyle + ";" + newBodyStyle : newBodyStyle
            );

            // translator
            // var translatorScript = document.createElement("script");
            // translatorScript.text = `(() => {
            //   var isHidden = false;
            //   while(!isHidden) {
            //    var gtNvframe = document.querySelectorAll("#gt-nvframe");
            //    if (gtNvframe && gtNvframe.length > 0) {
            //       gtNvframe[0].style.display = 'none';
            //       isHidden = true;
            //    }
            //   }
            // })()`;
            // bodyEL.appendChild(translatorScript);

            const translatorStyle = document.createElement("style");
            translatorStyle.textContent =
              "#gt-nvframe { display: none !important; } body {margin-top: 0px !important}";
            var header = htmlEl.getElementsByTagName("head")[0];
            header.appendChild(translatorStyle);

            // this.iframe.nativeElement.srcdoc = el.innerHTML;
            var doc = this.iframe.nativeElement.contentDocument;
            doc.open();
            doc.write(htmlEl.innerHTML);
            doc.close();

            this.loadingComplete = true;
            // console.log(el.innerHTML);
            this.iframe.nativeElement.animate(
              [
                { transform: "translateY(400px)", opacity: 0 },
                { transform: "translateY(0px)", opacity: 1 }
              ],
              {
                duration: 900
              }
            );
            await this.sleepFor(1200);
            this.addPointerToPage();
            resolve({ ref: this.iframe });
          } catch (error) {}
        },
        error => resolve({ error, ref: this.iframe })
      );
    });
  }

  async setPageHTML(pageUrl: string, html: string) {
    await this.scrollIntoView();
    this.displayPageUrl = pageUrl;
    let doc = this.iframe.nativeElement.contentDocument;
    doc.open();
    this.HTMLData = html;

    var el = document.createElement("html");
    el.innerHTML = this.HTMLData;
    var existingValue = el
      .getElementsByTagName("body")[0]
      .getAttribute("style");
    var css =
      "pointer-events: none; cursor: pointer; position: relative !important";
    el.getElementsByTagName("body")[0].setAttribute(
      "style",
      existingValue ? existingValue + ";" + css : css
    );

    this.loadingComplete = true;
    doc.write(el.innerHTML);
    doc.close();
    this.iframe.nativeElement.animate(
      [
        { transform: "translateY(400px)", opacity: 0 },
        { transform: "translateY(0px)", opacity: 1 }
      ],
      {
        duration: 900
      }
    );
    await this.sleepFor(1200);
    this.addPointerToPage();
    return { ref: this.iframe };
  }

  // default will have a hand as a pointer
  addPointerToPage() {
    try {
      document.querySelectorAll("#mousePointer")[0].remove();
    } catch (error) {}
    if (!this.pointerIcon)
      this.pointerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" fill="white" fill-opacity="0.01"/>
      <path d="M41 38.0001H19V44.0001H41V38.0001Z" fill="#2F88FF" stroke="black" stroke-width="4" stroke-linejoin="round"/>
      <path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M19.0001 38.0001C12.4812 30.8772 8.74054 26.7493 7.77829 25.6164C6.33491 23.9169 6.941 21.9962 10.5532 21.9962C14.1653 21.9962 16.2485 27.2816 19.0001 27.2816C19.0165 27.285 19.0176 20.5258 19.0034 7.00418C19.0017 5.34683 20.3438 4.00188 22.0012 4.00014L22.0043 4.00014C23.6635 4.00014 25.0085 5.34515 25.0085 7.0043V15.0137C32.9813 16.2226 37.3158 16.8895 38.0122 17.0145C39.0567 17.2021 41.0001 18.1991 41.0001 21.0682C41.0001 22.9809 41.0001 27.9582 41.0001 38.0001H19.0001Z" stroke="black" stroke-width="4" stroke-linejoin="round"/>
      </svg>`;
    var pointer = `<div id="mousePointer" style="position: absolute; bottom: -1000">${this.pointerIcon}</div>`;
    this.iframe.nativeElement.contentDocument.body.insertAdjacentHTML(
      "beforeend",
      pointer
    );
  }

  scrollPointerIntoView(x: string, y: string) {
    var el: any = this.iframe.nativeElement.contentDocument.querySelectorAll(
      "#mousePointer"
    )[0];
    el.style.left = x;
    el.style.top = y;
  }

  resetFramePage() {
    this.iframe.nativeElement.srcdoc = "";
    this.textStyles = [];
  }

  setFrameTitle(title: string) {
    this.FrameTitle = title;
    //console.log("title", this.FrameTitle);
  }

  // style an element
  async addAttributeToElement(
    selectQuery: string,
    index: number,
    replace: number,
    attribute: string,
    value: string,
    autoScroll: boolean = true
  ) {
    var document = this.iframe.nativeElement.contentDocument;
    if (!document.querySelectorAll(selectQuery)[index]) return;
    const exsitingValue = document
      .querySelectorAll(selectQuery)
      [index].getAttribute(attribute);
    if (autoScroll)
      await this.scrollToSelector(
        selectQuery,
        index,
        this.getHeight() / 2,
        this.getWidth() / 4
      );
    switch (replace) {
      // overwrite
      case 0:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(attribute, value);
        break;
      // add to last
      case 1:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(
            attribute,
            exsitingValue ? exsitingValue + ";" + value : value
          );
        break;
      // add to front
      case 2:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(
            attribute,
            value ? value + ";" + exsitingValue : exsitingValue
          );
        break;

      default:
        break;
    }

    // var doc = this.iframe.nativeElement.contentDocument;
    // doc.open();
    // doc.write(document.documentElement.innerHTML);
    // doc.close();
    // this.iframe.nativeElement.srcdoc = document.documentElement.innerHTML;
  }

  async styleText(
    text: string,
    caseSensitive: boolean,
    index: number,
    css: string
  ) {
    var doc = this.iframe.nativeElement.contentDocument;
    let html = doc.documentElement.innerHTML;
    // check if already highlighted
    var textStyleIndex = this.textStyles.findIndex(
      (curr: any) => curr.text == text && curr.index == index
    );
    // if highlighted then remove it and highlight again
    if (textStyleIndex == -1) {
      var indexes = this.getIndicesOf(text, html, caseSensitive);
      if (indexes && indexes.length > 0) {
        var id = "cs_" + (Math.random() + 1).toString(36).substring(7);
        html =
          html.substring(0, indexes[index]) +
          `<span id="${id}" style="${css}">` +
          html.substring(indexes[index], indexes[index] + text.length) +
          "</span>" +
          html.substring(indexes[index] + text.length);
        doc.open();
        doc.write(html);
        doc.close();
        this.textStyles.push({
          id,
          text,
          index,
          css
        });
        await this.scrollToSelector(
          `#${id}`,
          0,
          this.getHeight() / 2,
          this.getWidth() / 4
        );
      }
    } else {
      var textStyle = this.textStyles[textStyleIndex];
      await this.addAttributeToElement(
        `#${textStyle.id}`,
        0,
        0,
        "style",
        "",
        false
      );
      await this.sleepFor(600);
      await this.addAttributeToElement(`#${textStyle.id}`, 0, 1, "style", css);
    }
    await this.sleepFor(600);
  }

  // iframe height
  getHeight(): number {
    return this.iframe.nativeElement.getBoundingClientRect().height;
  }

  // iframe width
  getWidth(): number {
    return this.iframe.nativeElement.getBoundingClientRect().width;
  }

  // interact wih the js element and get output
  async getData(query: string, index: number, selector: string) {
    await this.scrollToSelector(
      query,
      index,
      this.getHeight() / 2,
      this.getWidth() / 4
    );
    if (
      !this.iframe.nativeElement.contentDocument.documentElement.querySelectorAll(
        query
      )[index]
    )
      return;
    return this.iframe.nativeElement.contentDocument.documentElement.querySelectorAll(
      query
    )[index][selector];
  }

  // set values for js dom elements
  async setData(query: string, index: number, selector: string, data: string) {
    try {
      if (
        !this.iframe.nativeElement.contentDocument.body.querySelectorAll(query)[
          index
        ]
      )
        return;
      await this.scrollToSelector(query, index, this.getHeight() / 2);
      await this.sleepFor(400);
      this.iframe.nativeElement.contentDocument.body.querySelectorAll(query)[
        index
      ][selector] = data;
      await this.sleepFor(600);
    } catch (error) {
      //console.log(error);
    }
  }

  async triggerFunction(
    query: string,
    index: number,
    event: string,
    data: any[] = []
  ) {
    var el = this.iframe.nativeElement.contentDocument.body.querySelectorAll(
      query
    )[index];
    if (!el) return;
    await this.scrollToSelector(
      query,
      index,
      this.getHeight() / 2,
      this.getWidth() / 4
    );
    var result = el[event](...data);
    await this.sleepFor(600);
    return result;
  }

  // search for all occurance of a text in a text
  getIndicesOf(searchStr: string, str: string, caseSensitive: boolean) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    var startIndex = 0,
      index: number,
      indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  openInNewWindowFn() {
    if (this.displayPageUrl) window.open(this.displayPageUrl);
  }

  copyToClipboardFn() {
    if (this.displayPageUrl) {
      const selBox = document.createElement("textarea");
      selBox.style.position = "fixed";
      selBox.style.left = "0";
      selBox.style.top = "0";
      selBox.style.opacity = "0";
      selBox.value = this.displayPageUrl;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand("copy");
      document.body.removeChild(selBox);
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2000);
    }
  }

  scaleFn(x: number) {
    var w = this.iframe.nativeElement.offsetWidth;
    var h = this.iframe.nativeElement.offsetHeight;
    w = 632;
    h = 324;
    if (x === -1) {
      this.scale = this.scale * 1.1;
      w = w * 0.9;
      h = h * 0.9;
      this.renderer.setStyle(this.iframe.nativeElement, "width", `${w}px`);
      this.renderer.setStyle(this.iframe.nativeElement, "height", `${h}px`);
    } else {
      this.scale = this.scale * 0.9;
      w = w * 1.1;
      h = h * 1.1;
      this.renderer.setStyle(this.iframe.nativeElement, "width", `${w}px`);
      this.renderer.setStyle(this.iframe.nativeElement, "height", `${h}px`);
    }
    this.renderer.setStyle(
      this.iframe.nativeElement,
      "transform",
      `scale(${this.scale})`
    );
  }

  isJSON(str: any) {
    try {
      return JSON.parse(str) && !!str;
    } catch (e) {
      return false;
    }
  }

  async sleepFor(time: number) {
    await new Promise(resolveTime => setTimeout(resolveTime, time));
  }
}
