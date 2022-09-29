import requests
import json
from bs4 import BeautifulSoup

#get the search results
def get_search_results(query):

    #calculate the length of something??? (it crashes if i dont do this)
    length = 21 + len(query)

    #define headers
    headers = {
        "Host": "kimcartoon.li",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
        "Accept": "*/*",
        "Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": str(length),
        "Origin": "https://kimcartoon.li",
        "Connection": "keep-alive",
        "Referer": "https://kimcartoon.li/",
        "Cookie": "_ga_X04565JYJY=GS1.1.1664254113.7.1.1664254644.0.0.0; _ga=GA1.1.847755101.1663190996; fpestid=U60feZB8iI3hAsk4sGIzZ1HCHhQtKIyOoT_dM2JTud7pL2aMnaHLTxKVTpOw_x3TW-0DGQ; adbWarn=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "TE": "trailers"
    }

    #payload
    data = {
        "type":"Cartoon",
        "keyword":query
    }

    url = "https://kimcartoon.li/Ajax/SearchSuggest"

    # make the request (gets search results)
    html = str(requests.post(url=url, headers=headers, data=data).content)
    html = html.removeprefix("b'")
    html = html[:-1]

    #parse out the response
    parsed_html = BeautifulSoup(html)
    list = parsed_html.findAll('a')

    #extrapolate requred data
    final_data = []
    for i in list:
        link = i.get('href')
        title = i.get_text()

        data = {"link":link, "title":title}
        final_data.append(data)

    #print it out (so node can pick it up... return does not work)
    print(json.dumps(final_data))


#gets episodes from selected link above
def get_episodes(link_to_season):

    headers = {
        "Host": "kimcartoon.li",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://kimcartoon.li",
        "Connection": "keep-alive",
        "Referer": "https://kimcartoon.li/",
        "Cookie": "_ga_X04565JYJY=GS1.1.1664254113.7.1.1664254644.0.0.0; _ga=GA1.1.847755101.1663190996; fpestid=U60feZB8iI3hAsk4sGIzZ1HCHhQtKIyOoT_dM2JTud7pL2aMnaHLTxKVTpOw_x3TW-0DGQ; adbWarn=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "TE": "trailers",
        "Upgrade-Insecure-Requests": "1"
    }

    #get data
    html = requests.get(link_to_season, headers=headers).content
    
    #parse it
    parsed = BeautifulSoup(html).find('div', {"class":"barContent episodeList"}).find_all('a')

    episodes = []
    for i in parsed:
        link = i.get('href')
        text = i.get_text().lstrip()

        data = {"link":f"https://kimcartoon.li/{link}", "title":text}
        episodes.append(data)

    print(json.dumps(episodes))


#gets the video link (bypasses anti-adblock stuff)
def get_video(link_to_video):
    headers = {
        "Host": "kimcartoon.li",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://kimcartoon.li",
        "Connection": "keep-alive",
        "Referer": "https://kimcartoon.li/",
        "Cookie": "_ga_X04565JYJY=GS1.1.1664254113.7.1.1664254644.0.0.0; _ga=GA1.1.847755101.1663190996; fpestid=U60feZB8iI3hAsk4sGIzZ1HCHhQtKIyOoT_dM2JTud7pL2aMnaHLTxKVTpOw_x3TW-0DGQ; adbWarn=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "TE": "trailers",
        "Upgrade-Insecure-Requests": "1"
    }

    #make the request and parse out the link
    html = requests.get(link_to_video, headers=headers).content
    video_link = BeautifulSoup(html).find('div', {"id": "divContentVideo"}).find('iframe').get('src')
    print(video_link)




# get_search_results('rick and morty')

# get_episodes("https://kimcartoon.li/Cartoon/Rick-and-Morty-Season-5")

# get_video("https://kimcartoon.li//Cartoon/Rick-and-Morty-Season-5/Episode-2?id=101837")