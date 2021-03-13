---
layout: page
title: skills
permalink: /skills/
---

<h3>Languages</h3>
{% assign n = 1%}
{% for skill in site.skills%}
{% if skill.category == 'languages'%}
<div class="collapsible" data-target="collapse{{n}}">
    <div class="crumb-container">
        <ol class="breadcrumb " itemscope itemtype="http://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                <a itemprop="item" href="#">
                    <span itemprop="name">{{skill.name}}</span>
                </a>
                <meta itemprop="position" content="1" />
            </li>
            {%for i in (1..4) %}
                {% if i <= skill.level%}
                    <li class="active" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                {% else %}
                    <li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                {% endif %}
                <a itemprop="item" href="#">
                    <span itemprop="name">{{i}}</span>
                </a>
                <meta itemprop="position" />
            </li> 
            {% endfor %} 
        </ol>
    </div>
</div>
<div id="collapse{{n}}" class="content">
  <p>{{skill.description}}</p>
  {% for proj in skill.projects %}
    <p>{{proj.name}}</p>
  {% endfor %}

</div>
{% assign n = n | plus:1 %}
{% endif %}
{% endfor %}

<h3>Software</h3>
{% for skill in site.skills%}
{% if skill.category == 'software'%}
<div class="collapsible" data-target="collapse{{n}}">
    <div class="crumb-container">
        <ol class="breadcrumb " itemscope itemtype="http://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                <a itemprop="item" href="#">
                    <span itemprop="name">{{skill.name}}</span>
                </a>
                <meta itemprop="position" content="1" />
            </li>
            {%for i in (1..4) %}
                {% if i <= skill.level%}
                    <li class="active" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                {% else %}
                    <li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
                {% endif %}
                <a itemprop="item" href="#">
                    <span itemprop="name">{{i}}</span>
                </a>
                <meta itemprop="position" />
            </li> 
            {% endfor %} 
        </ol>
    </div>
</div>
<div id="collapse{{n}}" class="content">
  <p>{{skill.description}}</p>
  {% for proj in skill.projects %}
    <p>{{proj.name}}</p>
  {% endfor %}

</div>
{% assign n = n | plus:1 %}
{% endif %}
{% endfor %}



