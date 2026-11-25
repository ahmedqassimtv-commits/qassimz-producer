import asyncio, json, math, sys
from playwright.async_api import async_playwright
async def main(d, out, pose, frames=0, fout=None, size=1024):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1024,'height':1024})
        await pg.goto(f'file:///tmp/c3/scene.html?d={d}')
        await pg.evaluate(f"build({json.dumps(json.load(open(d+'/spec.json')))})"); await pg.wait_for_timeout(900)
        await pg.evaluate(f"pose({pose})"); await pg.wait_for_timeout(150)
        await pg.screenshot(path=out, omit_background=True)
        for i in range(frames):
            t=i/frames*2*math.pi
            await pg.evaluate(f"pose({12+4*math.sin(2*t)},{-30*math.cos(t)},{-14*math.sin(t)})")
            await pg.screenshot(path=f'{fout}{i:02d}.png', omit_background=True)
        await b.close()
if __name__=='__main__':
    d,out=sys.argv[1],sys.argv[2]; pose=sys.argv[3] if len(sys.argv)>3 else "12,-20,0"
    fr=int(sys.argv[4]) if len(sys.argv)>4 else 0; fo=sys.argv[5] if len(sys.argv)>5 else None
    asyncio.run(main(d,out,pose,fr,fo))
